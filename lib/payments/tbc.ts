/**
 * TBC Pay (e-Commerce) integration.
 *
 * Flow (per TBC TPay v1 docs):
 *   1. POST /v1/tpay/access-token (form: client_Id, client_secret) with apikey header → access_token
 *   2. POST /v1/tpay/payments with amount + returnurl + callbackUrl + extra → returns { payId, links }
 *      Pull the `approval_url` link → redirect customer there
 *   3. After payment, browser is redirected to returnurl, and TBC pings callbackUrl server-side
 *   4. We GET /v1/tpay/payments/{payId} to read the canonical status (Succeeded | Failed | ...)
 *
 * Unlike BOG, TBC's server callback is NOT cryptographically signed — the only safe way to confirm
 * payment is to query the payment endpoint with our own access token. So both the browser callback
 * and the webhook handler do the same thing: fetch the status, mark Shopify paid on Succeeded.
 *
 * Reference: https://developers.tbcbank.ge/docs/tpay-introduction
 */

const TBC_BASE = "https://api.tbcbank.ge/v1/tpay";

export const isTbcConfigured =
  !!process.env.TBC_API_KEY &&
  !!process.env.TBC_CLIENT_ID &&
  !!process.env.TBC_CLIENT_SECRET;

export type TbcCreatePaymentInput = {
  /** Our internal order id (numeric Shopify ID). Echoed back in the callback as `extra`. */
  externalOrderId: string;
  totalAmount: number;
  currency: string;
  returnUrl: string;
  callbackUrl: string;
  language?: "KA" | "EN";
  /** Customer's IP address — TBC requires it. */
  userIpAddress: string;
};

export type TbcCreatePaymentResult = {
  payId: string;
  redirectUrl: string;
};

export type TbcPaymentDetails = {
  payId: string;
  status: "Created" | "Processing" | "Succeeded" | "Failed" | "Expired" | "Returned" | string;
  externalOrderId?: string;
  amount?: number;
  currency?: string;
};

// ---------------------- OAuth token cache ----------------------

type CachedToken = { token: string; expiresAt: number };
let cachedToken: CachedToken | null = null;

async function getAccessToken(): Promise<string> {
  if (!isTbcConfigured) throw new Error("TBC is not configured");
  if (cachedToken && cachedToken.expiresAt > Date.now() + 30_000) {
    return cachedToken.token;
  }

  const params = new URLSearchParams({
    client_Id: process.env.TBC_CLIENT_ID!,
    client_secret: process.env.TBC_CLIENT_SECRET!,
  });

  const res = await fetch(`${TBC_BASE}/access-token`, {
    method: "POST",
    headers: {
      apikey: process.env.TBC_API_KEY!,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`TBC access-token failed: ${res.status} ${await res.text()}`);
  }

  const json = (await res.json()) as { access_token: string; expires_in: number };
  cachedToken = {
    token: json.access_token,
    expiresAt: Date.now() + json.expires_in * 1000,
  };
  return cachedToken.token;
}

// ---------------------- Create payment ----------------------

export async function createTbcPayment(
  input: TbcCreatePaymentInput,
): Promise<TbcCreatePaymentResult | null> {
  if (!isTbcConfigured) return null;

  const token = await getAccessToken();

  const body = {
    amount: {
      currency: input.currency,
      total: input.totalAmount,
      subTotal: input.totalAmount,
      tax: 0,
      shipping: 0,
    },
    returnurl: input.returnUrl,
    callbackUrl: input.callbackUrl,
    extra: input.externalOrderId,
    userIpAddress: input.userIpAddress,
    expirationMinutes: "12",
    preAuth: false,
    language: input.language ?? "KA",
    // methods: omitted → TBC defaults to all enabled card brands for the merchant
  };

  const res = await fetch(`${TBC_BASE}/payments`, {
    method: "POST",
    headers: {
      apikey: process.env.TBC_API_KEY!,
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  if (!res.ok) {
    console.error("[tbc] payment create rejected:", res.status, await res.text());
    return null;
  }

  type TbcCreateResponse = {
    payId?: string;
    links?: { uri?: string; method?: string; rel?: string }[];
  };
  const json = (await res.json()) as TbcCreateResponse;
  const approval = json.links?.find((l) => l.rel === "approval_url")?.uri;
  if (!json.payId || !approval) {
    console.error("[tbc] missing payId or approval_url:", JSON.stringify(json));
    return null;
  }

  return { payId: json.payId, redirectUrl: approval };
}

// ---------------------- Status check ----------------------

export async function getTbcPayment(payId: string): Promise<TbcPaymentDetails | null> {
  if (!isTbcConfigured) return null;
  const token = await getAccessToken();

  const res = await fetch(`${TBC_BASE}/payments/${encodeURIComponent(payId)}`, {
    headers: {
      apikey: process.env.TBC_API_KEY!,
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (!res.ok) {
    console.error("[tbc] payment fetch failed:", res.status, await res.text());
    return null;
  }

  type TbcStatusResponse = {
    payId?: string;
    status?: string;
    extra?: string;
    amount?: { total?: number; currency?: string };
  };
  const json = (await res.json()) as TbcStatusResponse;
  if (!json.payId || !json.status) return null;

  return {
    payId: json.payId,
    status: json.status,
    externalOrderId: json.extra,
    amount: json.amount?.total,
    currency: json.amount?.currency,
  };
}

// ---------------------- Helper: best-effort client IP from a Request ----------------------

export function getClientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  const real = req.headers.get("x-real-ip");
  if (real) return real;
  return "0.0.0.0";
}
