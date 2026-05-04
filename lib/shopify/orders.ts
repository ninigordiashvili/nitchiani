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
  notes?: string;
  paymentMethod: CheckoutPaymentMethod;
  locale: string;
  lines: ManualOrderLine[];
  subtotal: Money;
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
 * Creates a Shopify order via the REST Admin API with a manual payment status (pending).
 * Used for both bank-transfer and cash-on-delivery flows in Phase 1 of the storefront.
 *
 * Returns the Shopify order ID on success, or null when:
 * - Admin API credentials aren't configured (dev/local)
 * - Any cart line lacks a real numeric Shopify variant ID (e.g. dummy product data)
 * - Shopify rejects the request
 *
 * The caller is expected to fall back to a local pseudo-ID so the checkout UX still completes.
 */
export async function createManualOrder(input: ManualOrderInput): Promise<string | null> {
  if (!SHOPIFY_DOMAIN || !SHOPIFY_ADMIN_TOKEN) return null;

  const lineItems = input.lines.map((l) => ({
    variant_id: gidToNumericId(l.variantId),
    quantity: l.quantity,
    price: l.unitPrice.amount,
  }));

  if (lineItems.some((li) => li.variant_id === null)) {
    console.warn(
      "[shopify/orders] Skipping Admin API call — at least one variant ID is not a numeric Shopify GID. Wire the Storefront API client to populate real variant IDs.",
    );
    return null;
  }

  const paymentTag = paymentMethodTag(input.paymentMethod);

  const noteLines: string[] = [];
  noteLines.push(paymentMethodNote(input.paymentMethod));
  noteLines.push(`Locale: ${input.locale}`);
  if (input.notes) noteLines.push(`Customer note: ${input.notes}`);

  const body = {
    order: {
      email: input.email,
      phone: input.phone,
      currency: input.subtotal.currencyCode,
      financial_status: "pending",
      send_receipt: false,
      send_fulfillment_receipt: false,
      tags: ["online-store", paymentTag, `lang:${input.locale}`].join(", "),
      note: noteLines.join("\n"),
      line_items: lineItems,
      shipping_address: {
        first_name: input.firstName,
        last_name: input.lastName,
        address1: input.address,
        city: input.city,
        zip: input.postalCode ?? "",
        country: "Georgia",
        country_code: "GE",
        phone: input.phone,
      },
      billing_address: {
        first_name: input.firstName,
        last_name: input.lastName,
        address1: input.address,
        city: input.city,
        zip: input.postalCode ?? "",
        country: "Georgia",
        country_code: "GE",
        phone: input.phone,
      },
      note_attributes: [
        { name: "payment_method", value: input.paymentMethod },
        { name: "locale", value: input.locale },
      ],
    },
  };

  const res = await fetch(
    `https://${SHOPIFY_DOMAIN}/admin/api/${API_VERSION}/orders.json`,
    {
      method: "POST",
      headers: {
        "X-Shopify-Access-Token": SHOPIFY_ADMIN_TOKEN,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
      cache: "no-store",
    },
  );

  if (!res.ok) {
    const text = await res.text();
    console.error("[shopify/orders] Admin API rejected order:", res.status, text);
    return null;
  }

  const json = (await res.json()) as { order?: { id?: number; name?: string } };
  if (!json.order?.id) return null;

  // Prefer the human-readable name (e.g. "#1042") for the success page if present.
  return json.order.name ?? String(json.order.id);
}

/**
 * Variant of createManualOrder that returns the numeric Shopify order ID alongside the name.
 * Needed for BOG flow: we pass the numeric ID to BOG as external_order_id, then look it up later
 * from the webhook to mark it paid.
 */
export async function createPendingOrder(
  input: ManualOrderInput,
): Promise<{ id: number; name: string } | null> {
  // We re-execute the same Admin API POST as createManualOrder but capture both id and name.
  if (!SHOPIFY_DOMAIN || !SHOPIFY_ADMIN_TOKEN) return null;

  const lineItems = input.lines.map((l) => ({
    variant_id: gidToNumericId(l.variantId),
    quantity: l.quantity,
    price: l.unitPrice.amount,
  }));
  if (lineItems.some((li) => li.variant_id === null)) return null;

  const tag = paymentMethodTag(input.paymentMethod);
  const note = paymentMethodNote(input.paymentMethod);

  const body = {
    order: {
      email: input.email,
      phone: input.phone,
      currency: input.subtotal.currencyCode,
      financial_status: "pending",
      send_receipt: false,
      send_fulfillment_receipt: false,
      tags: ["online-store", tag, `lang:${input.locale}`].join(", "),
      note:
        `${note}\nLocale: ${input.locale}` +
        (input.notes ? `\nCustomer note: ${input.notes}` : ""),
      line_items: lineItems,
      shipping_address: {
        first_name: input.firstName,
        last_name: input.lastName,
        address1: input.address,
        city: input.city,
        zip: input.postalCode ?? "",
        country: "Georgia",
        country_code: "GE",
        phone: input.phone,
      },
      billing_address: {
        first_name: input.firstName,
        last_name: input.lastName,
        address1: input.address,
        city: input.city,
        zip: input.postalCode ?? "",
        country: "Georgia",
        country_code: "GE",
        phone: input.phone,
      },
      note_attributes: [
        { name: "payment_method", value: input.paymentMethod },
        { name: "locale", value: input.locale },
      ],
    },
  };

  const res = await fetch(
    `https://${SHOPIFY_DOMAIN}/admin/api/${API_VERSION}/orders.json`,
    {
      method: "POST",
      headers: {
        "X-Shopify-Access-Token": SHOPIFY_ADMIN_TOKEN,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
      cache: "no-store",
    },
  );
  if (!res.ok) {
    console.error("[shopify/orders] pending order create failed:", res.status, await res.text());
    return null;
  }
  const json = (await res.json()) as { order?: { id?: number; name?: string } };
  if (!json.order?.id || !json.order.name) return null;
  return { id: json.order.id, name: json.order.name };
}

/**
 * Marks a previously-created Shopify order as paid (financial_status: paid).
 * Called by the BOG webhook once payment confirmation arrives.
 */
export async function markOrderPaid(orderId: number, gateway: string): Promise<boolean> {
  if (!SHOPIFY_DOMAIN || !SHOPIFY_ADMIN_TOKEN) return false;

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
    return false;
  }
  return true;
}
