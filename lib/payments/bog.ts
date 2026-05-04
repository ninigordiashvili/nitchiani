import { createPublicKey, createVerify } from "node:crypto";

/**
 * Bank of Georgia (BOG) e-Commerce / Business API integration.
 *
 * Flow (per BOG ე-კომერცია docs):
 *   1. POST OAuth2 client_credentials → access_token (cached in memory)
 *   2. POST /payments/v1/ecommerce/orders with basket + redirect_urls + callback_url → returns { id, _links.redirect.href }
 *   3. Customer pays at the returned redirect URL
 *   4. BOG sends asynchronous callback to callback_url (signed) — handled by /api/checkout/webhook
 *   5. Browser is redirected back to redirect_urls.success or .fail
 *
 * NOTE: BOG occasionally renames request fields between API versions. The shapes below match the
 * v1 e-commerce spec. If a 400 comes back, cross-check against the BOG developer portal:
 *   https://api.bog.ge/docs/payments/ecommerce
 */

const BOG_OAUTH_URL = "https://oauth2.bog.ge/auth/realms/bog/protocol/openid-connect/token";
const BOG_API_BASE = "https://api.bog.ge";

export const isBogConfigured =
  !!process.env.BOG_CLIENT_ID && !!process.env.BOG_CLIENT_SECRET;

export type BogBasketItem = {
  product_id: string;
  description?: string;
  quantity: number;
  unit_price: number;
};

export type BogCreateOrderInput = {
  externalOrderId: string;
  totalAmount: number;
  currency: string;
  basket: BogBasketItem[];
  buyer?: {
    full_name?: string;
    email?: string;
    phone?: string;
  };
  successUrl: string;
  failUrl: string;
  callbackUrl: string;
  /** Free-form locale for the hosted payment page ("ka" | "en" | "ru"). */
  language?: "ka" | "en" | "ru";
};

export type BogCreateOrderResult = {
  id: string;
  redirectUrl: string;
};

// ---------------------- OAuth token cache ----------------------

type CachedToken = { token: string; expiresAt: number };
let cachedToken: CachedToken | null = null;

async function getAccessToken(): Promise<string> {
  if (!isBogConfigured) throw new Error("BOG is not configured");
  if (cachedToken && cachedToken.expiresAt > Date.now() + 30_000) {
    return cachedToken.token;
  }

  const res = await fetch(BOG_OAUTH_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization:
        "Basic " +
        Buffer.from(
          `${process.env.BOG_CLIENT_ID}:${process.env.BOG_CLIENT_SECRET}`,
        ).toString("base64"),
    },
    body: "grant_type=client_credentials",
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`BOG OAuth failed: ${res.status} ${await res.text()}`);
  }

  const json = (await res.json()) as { access_token: string; expires_in: number };
  cachedToken = {
    token: json.access_token,
    expiresAt: Date.now() + json.expires_in * 1000,
  };
  return cachedToken.token;
}

// ---------------------- Order creation ----------------------

export async function createBogPaymentOrder(
  input: BogCreateOrderInput,
): Promise<BogCreateOrderResult | null> {
  if (!isBogConfigured) return null;

  const token = await getAccessToken();

  const body = {
    callback_url: input.callbackUrl,
    external_order_id: input.externalOrderId,
    purchase_units: {
      currency: input.currency,
      total_amount: input.totalAmount,
      basket: input.basket,
    },
    redirect_urls: {
      success: input.successUrl,
      fail: input.failUrl,
    },
    buyer: input.buyer,
    application_type: "web",
    capture: "automatic",
  };

  const res = await fetch(`${BOG_API_BASE}/payments/v1/ecommerce/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "Accept-Language": input.language ?? "ka",
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  if (!res.ok) {
    console.error("[bog] order create rejected:", res.status, await res.text());
    return null;
  }

  type BogOrderResponse = {
    id: string;
    _links?: { redirect?: { href?: string }; details?: { href?: string } };
  };
  const json = (await res.json()) as BogOrderResponse;
  const redirectUrl = json._links?.redirect?.href;
  if (!json.id || !redirectUrl) {
    console.error("[bog] missing id or redirect URL in response:", JSON.stringify(json));
    return null;
  }

  return { id: json.id, redirectUrl };
}

// ---------------------- Order status (used by callback to confirm) ----------------------

export type BogOrderDetails = {
  id: string;
  externalOrderId?: string;
  status: string;
  paymentStatus?: string;
  amount?: number;
  currency?: string;
};

export async function getBogOrder(orderId: string): Promise<BogOrderDetails | null> {
  if (!isBogConfigured) return null;
  const token = await getAccessToken();

  const res = await fetch(
    `${BOG_API_BASE}/payments/v1/receipt/${encodeURIComponent(orderId)}`,
    {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    },
  );

  if (!res.ok) {
    console.error("[bog] receipt fetch failed:", res.status, await res.text());
    return null;
  }

  type BogReceipt = {
    order_id: string;
    external_order_id?: string;
    order_status?: { key?: string };
    payment_detail?: { transfer_method?: string; code?: string };
    purchase_units?: { transfer_amount?: number; currency_code?: string };
  };
  const json = (await res.json()) as BogReceipt;

  return {
    id: json.order_id,
    externalOrderId: json.external_order_id,
    status: json.order_status?.key ?? "unknown",
    paymentStatus: json.payment_detail?.code,
    amount: json.purchase_units?.transfer_amount,
    currency: json.purchase_units?.currency_code,
  };
}

// ---------------------- Webhook signature verification ----------------------

/**
 * BOG signs callback bodies with its private key. The merchant verifies with the BOG public key
 * (PEM, downloadable from the BOG developer portal) — value goes into BOG_PUBLIC_KEY env.
 *
 * Header: Callback-Signature (base64-encoded RSA SHA-256 signature of the raw request body).
 */
export function verifyBogCallback(rawBody: string, signatureBase64: string): boolean {
  const pem = process.env.BOG_PUBLIC_KEY;
  if (!pem) {
    console.warn("[bog] BOG_PUBLIC_KEY not set — callback signature cannot be verified");
    return false;
  }

  try {
    const key = createPublicKey({
      key: pem.includes("-----BEGIN") ? pem : `-----BEGIN PUBLIC KEY-----\n${pem}\n-----END PUBLIC KEY-----`,
      format: "pem",
    });
    const verifier = createVerify("RSA-SHA256");
    verifier.update(rawBody);
    verifier.end();
    return verifier.verify(key, Buffer.from(signatureBase64, "base64"));
  } catch (err) {
    console.error("[bog] signature verification threw:", err);
    return false;
  }
}
