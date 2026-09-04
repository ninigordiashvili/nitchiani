import type { Money } from "../money";

export type ManualOrderLine = {
  variantId: string;
  productHandle: string;
  productTitle: string;
  variantTitle: string;
  unitPrice: Money;
  quantity: number;
};

export type CheckoutPaymentMethod = "bank_transfer" | "cod" | "bog_card" | "tbc_card";

export type ManualOrderInput = {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  postalCode?: string;
  /** Coordinates from the checkout map picker, when the customer used it. */
  lat?: number;
  lng?: number;
  notes?: string;
  paymentMethod: CheckoutPaymentMethod;
  locale: string;
  lines: ManualOrderLine[];
  subtotal: Money;
  /** Server-validated discount in the same currency as `subtotal`. Omit when no coupon applies. */
  discount?: Money;
  /** Server-validated final amount (subtotal - discount). Falls back to `subtotal` when omitted. */
  total?: Money;
  /** Canonical coupon code that produced the discount. Used to attach a Shopify `discount_codes` entry. */
  couponCode?: string;
};

const SHOPIFY_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN;
const SHOPIFY_ADMIN_TOKEN = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;
const API_VERSION = process.env.SHOPIFY_API_VERSION ?? "2025-01";

/**
 * Extracts the numeric ID from a Shopify GID.
 * `gid://shopify/ProductVariant/12345` → 12345
 * Returns null for non-numeric tails (e.g. dummy data).
 */
function gidToNumericId(gid: string): number | null {
  const tail = gid.split("/").pop() ?? "";
  const n = Number.parseInt(tail, 10);
  return Number.isFinite(n) && String(n) === tail ? n : null;
}

function paymentMethodTag(method: CheckoutPaymentMethod): string {
  switch (method) {
    case "cod": return "payment:cash-on-delivery";
    case "bog_card": return "payment:bog-card";
    case "tbc_card": return "payment:tbc-card";
    case "bank_transfer": return "payment:bank-transfer";
  }
}

function paymentMethodNote(method: CheckoutPaymentMethod): string {
  switch (method) {
    case "cod": return "Payment: Cash on delivery (collect at handover)";
    case "bog_card": return "Payment: BOG card (awaiting confirmation)";
    case "tbc_card": return "Payment: TBC card (awaiting confirmation)";
    case "bank_transfer": return "Payment: Bank transfer (awaiting receipt)";
  }
}

/**
 * Builds the Admin REST `order` payload shared by every checkout flow.
 *
 * Both the manual (bank transfer / COD) and the card (BOG / TBC) flows create the same kind of
 * pending Shopify order — they only differ in what the caller needs back. Keeping one builder
 * means a field added for one flow can't silently go missing from the other, which is exactly
 * how card orders used to lose their coupon.
 *
 * Returns `null` when the order can't be represented in Shopify (see `postOrder`).
 */
function buildOrderPayload(input: ManualOrderInput) {
  const lineItems = input.lines.map((l) => ({
    variant_id: gidToNumericId(l.variantId),
    quantity: l.quantity,
    price: l.unitPrice.amount,
  }));

  if (lineItems.some((li) => li.variant_id === null)) return null;

  const noteLines: string[] = [paymentMethodNote(input.paymentMethod), `Locale: ${input.locale}`];
  if (input.couponCode) noteLines.push(`Coupon: ${input.couponCode}`);
  if (input.notes) noteLines.push(`Customer note: ${input.notes}`);

  const discountAmount = input.discount ? Number.parseFloat(input.discount.amount) : 0;
  const hasDiscount = !!input.couponCode && Number.isFinite(discountAmount) && discountAmount > 0;

  const address = {
    first_name: input.firstName,
    last_name: input.lastName,
    address1: input.address,
    city: input.city,
    zip: input.postalCode ?? "",
    country: "Georgia",
    country_code: "GE",
    phone: input.phone,
  };

  return {
    order: {
      email: input.email,
      phone: input.phone,
      currency: input.subtotal.currencyCode,
      financial_status: "pending",
      send_receipt: false,
      send_fulfillment_receipt: false,
      tags: ["online-store", paymentMethodTag(input.paymentMethod), `lang:${input.locale}`].join(", "),
      note: noteLines.join("\n"),
      line_items: lineItems,
      // Pass the server-validated coupon through to Shopify so the order ledger reflects the
      // amount we actually charge at the gateway (and so refunds calculate correctly).
      // `fixed_amount` is the simplest representation — Shopify accepts it for any discount type.
      ...(hasDiscount
        ? {
            discount_codes: [
              { code: input.couponCode, amount: discountAmount.toFixed(2), type: "fixed_amount" },
            ],
          }
        : {}),
      shipping_address: address,
      billing_address: address,
      note_attributes: [
        { name: "payment_method", value: input.paymentMethod },
        { name: "locale", value: input.locale },
        ...(input.couponCode ? [{ name: "coupon_code", value: input.couponCode }] : []),
      ],
    },
  };
}

/**
 * Creates the Shopify order via the REST Admin API with a manual payment status (pending).
 *
 * Returns both the numeric ID and the human-readable name, or null when:
 * - Admin API credentials aren't configured (dev/local)
 * - Any cart line lacks a real numeric Shopify variant ID (e.g. dummy product data)
 * - Shopify rejects the request
 */
async function postOrder(
  input: ManualOrderInput,
): Promise<{ id: number; name: string } | null> {
  if (!SHOPIFY_DOMAIN || !SHOPIFY_ADMIN_TOKEN) return null;

  const body = buildOrderPayload(input);
  if (!body) {
    console.warn(
      "[shopify/orders] Skipping Admin API call — at least one variant ID is not a numeric Shopify GID. Wire the Storefront API client to populate real variant IDs.",
    );
    return null;
  }

  const res = await fetch(`https://${SHOPIFY_DOMAIN}/admin/api/${API_VERSION}/orders.json`, {
    method: "POST",
    headers: {
      "X-Shopify-Access-Token": SHOPIFY_ADMIN_TOKEN,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  if (!res.ok) {
    console.error("[shopify/orders] Admin API rejected order:", res.status, await res.text());
    return null;
  }

  const json = (await res.json()) as { order?: { id?: number; name?: string } };
  if (!json.order?.id) return null;
  return { id: json.order.id, name: json.order.name ?? String(json.order.id) };
}

/**
 * Manual (bank-transfer / cash-on-delivery) flow. Returns the human-readable order name
 * for the success page, or null so the caller can fall back to a local pseudo-ID.
 */
export async function createManualOrder(input: ManualOrderInput): Promise<string | null> {
  const order = await postOrder(input);
  return order ? order.name : null;
}

/**
 * Card flow (BOG / TBC). Same order, but the caller also needs the numeric ID to hand the
 * gateway as `external_order_id` and to look up again from the webhook.
 */
export async function createPendingOrder(
  input: ManualOrderInput,
): Promise<{ id: number; name: string } | null> {
  return postOrder(input);
}

/**
 * Fetches a Shopify order by numeric ID and returns it in the shape our email template
 * + `sendOrderConfirmation` expect. Used by the BOG/TBC webhooks to fire the confirmation
 * email once the gateway settles — the webhook itself only knows the external order ID.
 *
 * Returns `null` when Shopify Admin isn't configured (local/dev) or the request fails.
 */
export async function getOrderForConfirmation(
  orderId: number,
): Promise<(ManualOrderInput & { orderId: string }) | null> {
  if (!SHOPIFY_DOMAIN || !SHOPIFY_ADMIN_TOKEN) return null;

  const res = await fetch(
    `https://${SHOPIFY_DOMAIN}/admin/api/${API_VERSION}/orders/${orderId}.json`,
    {
      headers: {
        "X-Shopify-Access-Token": SHOPIFY_ADMIN_TOKEN,
        Accept: "application/json",
      },
      cache: "no-store",
    },
  );

  if (!res.ok) {
    console.error("[shopify/orders] getOrderForConfirmation failed:", res.status, await res.text());
    return null;
  }

  type ShopifyOrderResponse = {
    order?: {
      name?: string;
      email?: string;
      phone?: string;
      currency?: string;
      subtotal_price?: string;
      total_discounts?: string;
      total_price?: string;
      shipping_address?: {
        first_name?: string;
        last_name?: string;
        address1?: string;
        city?: string;
        zip?: string;
        phone?: string;
      };
      billing_address?: { phone?: string };
      line_items?: Array<{
        variant_id?: number;
        product_id?: number;
        title?: string;
        variant_title?: string;
        quantity?: number;
        price?: string;
        sku?: string;
      }>;
      discount_codes?: Array<{ code?: string; amount?: string; type?: string }>;
      note_attributes?: Array<{ name?: string; value?: string }>;
    };
  };

  let parsed: ShopifyOrderResponse;
  try {
    parsed = (await res.json()) as ShopifyOrderResponse;
  } catch {
    return null;
  }
  const o = parsed.order;
  if (!o) return null;

  const currency = o.currency ?? "GEL";
  const attr = (name: string) =>
    o.note_attributes?.find((a) => a.name === name)?.value;
  const paymentMethod = (attr("payment_method") ?? "bog_card") as CheckoutPaymentMethod;
  const locale = attr("locale") ?? "en";
  const couponCode = o.discount_codes?.[0]?.code ?? attr("coupon_code");

  const ship = o.shipping_address ?? {};
  const lines: ManualOrderLine[] = (o.line_items ?? []).map((li) => ({
    // We don't get a clean variant GID back from Admin REST — synthesise something stable
    // enough for the email's display purposes (it's not used to look anything up downstream).
    variantId: `gid://shopify/ProductVariant/${li.variant_id ?? 0}`,
    productHandle: li.sku ?? String(li.product_id ?? ""),
    productTitle: li.title ?? "",
    variantTitle: li.variant_title ?? "",
    unitPrice: { amount: li.price ?? "0.00", currencyCode: currency },
    quantity: li.quantity ?? 1,
  }));

  return {
    firstName: ship.first_name ?? "",
    lastName: ship.last_name ?? "",
    phone: ship.phone ?? o.phone ?? o.billing_address?.phone ?? "",
    email: o.email ?? "",
    address: ship.address1 ?? "",
    city: ship.city ?? "",
    postalCode: ship.zip ?? undefined,
    notes: undefined,
    paymentMethod,
    locale,
    lines,
    subtotal: { amount: o.subtotal_price ?? "0.00", currencyCode: currency },
    discount:
      o.total_discounts && Number.parseFloat(o.total_discounts) > 0
        ? { amount: o.total_discounts, currencyCode: currency }
        : undefined,
    total: { amount: o.total_price ?? o.subtotal_price ?? "0.00", currencyCode: currency },
    couponCode: couponCode ?? undefined,
    orderId: o.name ?? String(orderId),
  };
}

/**
 * Order-tracking lookup. Fetches by the public order name (e.g. `#1001`) — that's the
 * value the customer has from the confirmation email — and returns a slim
 * tracking-page-friendly shape rather than the full Shopify object.
 *
 * Returns `null` when Shopify Admin isn't configured (so the page can fall back to its
 * static explainer) or when no order matches the name.
 */
export type OrderTracking = {
  /** Human-readable order name (e.g. `#1001`). */
  name: string;
  /** Order placement timestamp (ISO). */
  createdAt: string;
  /** Shopify's financial status — `paid` / `pending` / `partially_paid` / etc. */
  financialStatus: string | null;
  /** Shopify's fulfillment status — `fulfilled` / `partial` / `null`. */
  fulfillmentStatus: string | null;
  lines: Array<{ title: string; variantTitle?: string | null; quantity: number }>;
  /** Latest fulfillment's tracking info, if any. Customers will mostly use this. */
  tracking: {
    company?: string | null;
    number?: string | null;
    url?: string | null;
  } | null;
  /** Inferred step (1–4) for the timeline UI. */
  step: 1 | 2 | 3 | 4;
};

export async function getOrderByName(rawName: string): Promise<OrderTracking | null> {
  if (!SHOPIFY_DOMAIN || !SHOPIFY_ADMIN_TOKEN) return null;
  if (!rawName.trim()) return null;
  // Customers often share the order number without the leading `#`; Shopify needs it.
  const name = rawName.trim().startsWith("#") ? rawName.trim() : `#${rawName.trim()}`;

  const res = await fetch(
    `https://${SHOPIFY_DOMAIN}/admin/api/${API_VERSION}/orders.json?name=${encodeURIComponent(name)}&status=any&limit=1`,
    {
      headers: {
        "X-Shopify-Access-Token": SHOPIFY_ADMIN_TOKEN,
        Accept: "application/json",
      },
      cache: "no-store",
    },
  );
  if (!res.ok) {
    console.error("[shopify/orders] getOrderByName failed:", res.status, await res.text());
    return null;
  }

  type ShopifyOrdersResponse = {
    orders?: Array<{
      name?: string;
      created_at?: string;
      financial_status?: string;
      fulfillment_status?: string | null;
      line_items?: Array<{ title?: string; variant_title?: string | null; quantity?: number }>;
      fulfillments?: Array<{
        tracking_company?: string | null;
        tracking_number?: string | null;
        tracking_url?: string | null;
        tracking_numbers?: string[];
        tracking_urls?: string[];
      }>;
    }>;
  };

  let parsed: ShopifyOrdersResponse;
  try {
    parsed = (await res.json()) as ShopifyOrdersResponse;
  } catch {
    return null;
  }
  const o = parsed.orders?.[0];
  if (!o) return null;

  const lines = (o.line_items ?? []).map((li) => ({
    title: li.title ?? "",
    variantTitle: li.variant_title ?? null,
    quantity: li.quantity ?? 1,
  }));

  // Pull from the latest fulfillment that actually has tracking data attached.
  const latestFul = (o.fulfillments ?? [])
    .slice()
    .reverse()
    .find((f) => f.tracking_number || (f.tracking_numbers && f.tracking_numbers.length > 0));
  const tracking = latestFul
    ? {
        company: latestFul.tracking_company ?? null,
        number: latestFul.tracking_number ?? latestFul.tracking_numbers?.[0] ?? null,
        url: latestFul.tracking_url ?? latestFul.tracking_urls?.[0] ?? null,
      }
    : null;

  // Derive a 1–4 step index for the timeline UI. The four conceptual stages are:
  //   1 — order placed
  //   2 — payment confirmed
  //   3 — hand-prepared in the studio (any fulfillment exists)
  //   4 — on its way / delivered (fulfillment has tracking attached)
  const financial = o.financial_status ?? null;
  const fulfillment = o.fulfillment_status ?? null;
  let step: 1 | 2 | 3 | 4 = 1;
  if (financial === "paid" || financial === "partially_paid") step = 2;
  if (fulfillment === "partial" || fulfillment === "fulfilled") step = 3;
  if (tracking?.number) step = 4;

  return {
    name: o.name ?? name,
    createdAt: o.created_at ?? "",
    financialStatus: financial,
    fulfillmentStatus: fulfillment,
    lines,
    tracking,
    step,
  };
}

/**
 * Outcome of a `markOrderPaid` attempt.
 * - `marked`  — this call recorded the sale transaction (first time the order settled)
 * - `already` — a successful sale/capture was already on the order; nothing was written
 * - `failed`  — Shopify rejected the write, or Admin isn't configured
 *
 * Callers use the `marked` / `already` distinction to fire side effects (the confirmation
 * email) exactly once, no matter how many times a gateway replays its callback.
 */
export type MarkPaidResult = "marked" | "already" | "failed";

/** Transaction kinds that mean "the money has been taken". */
const SETTLED_KINDS = new Set(["sale", "capture"]);

/**
 * Returns true when the order already carries a successful sale/capture transaction.
 * Returns false when it doesn't — and also when we can't tell (a failed lookup), so that a
 * transient Admin API blip degrades to the old behaviour rather than dropping a real payment.
 */
async function hasSettledTransaction(orderId: number): Promise<boolean> {
  const res = await fetch(
    `https://${SHOPIFY_DOMAIN}/admin/api/${API_VERSION}/orders/${orderId}/transactions.json`,
    {
      headers: { "X-Shopify-Access-Token": SHOPIFY_ADMIN_TOKEN as string, Accept: "application/json" },
      cache: "no-store",
    },
  ).catch(() => null);

  if (!res || !res.ok) {
    console.warn("[shopify/orders] could not read transactions for", orderId, "— proceeding");
    return false;
  }

  const json = (await res.json().catch(() => null)) as {
    transactions?: Array<{ kind?: string; status?: string }>;
  } | null;

  return (json?.transactions ?? []).some(
    (t) => t.status === "success" && SETTLED_KINDS.has(t.kind ?? ""),
  );
}

/**
 * Marks a previously-created Shopify order as paid by recording a sale transaction.
 *
 * Idempotent: both gateways replay their callbacks (BOG retries any non-2xx, and the TBC flow
 * deliberately marks paid from the browser return *and* the async webhook), so a naive POST
 * records the sale two or three times over — leaving the order looking overpaid in Shopify and
 * emailing the customer a confirmation for each replay. We check for an existing successful
 * sale/capture first and no-op if one is there.
 */
export async function markOrderPaid(
  orderId: number,
  gateway: string,
): Promise<MarkPaidResult> {
  if (!SHOPIFY_DOMAIN || !SHOPIFY_ADMIN_TOKEN) return "failed";

  if (await hasSettledTransaction(orderId)) {
    console.info("[shopify/orders] order already settled, skipping duplicate sale:", orderId);
    return "already";
  }

  const res = await fetch(
    `https://${SHOPIFY_DOMAIN}/admin/api/${API_VERSION}/orders/${orderId}/transactions.json`,
    {
      method: "POST",
      headers: {
        "X-Shopify-Access-Token": SHOPIFY_ADMIN_TOKEN,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        transaction: {
          kind: "sale",
          status: "success",
          gateway,
        },
      }),
      cache: "no-store",
    },
  );

  if (!res.ok) {
    console.error("[shopify/orders] mark paid failed:", res.status, await res.text());
    return "failed";
  }
  return "marked";
}
