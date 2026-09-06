import { composeNotes } from "../checkout/geo";
import { type InsufficientStock, parseInsufficientStock } from "./stock-error";
import type { ManualOrderInput } from "../shopify/orders";
import { parseEchoDeskGid } from "./adapt";

/**
 * Guest checkout against EchoDesk — `POST /api/ecommerce/client/guest-checkout/`.
 *
 * Guest, deliberately: the storefront has no accounts, and the order's `public_token` is what
 * lets the customer track it afterwards without one.
 *
 * Two possible outcomes, and the caller has to handle both:
 *   - `payment_url` present → the tenant has a card provider live; send the shopper there.
 *   - no `payment_url`      → the order is already placed (cash on delivery / bank transfer);
 *                             show the confirmation.
 */
const API_URL = process.env.NEXT_PUBLIC_ECHODESK_API_URL?.replace(/\/+$/, "");

/**
 * Either the placed order, or the reason it was refused.
 *
 * EchoDesk's 400s carry genuinely useful, customer-facing text — "Cash on delivery is only
 * available for pickup orders", for instance — and collapsing those into a generic failure
 * leaves the shopper stuck with no idea what to change. 4xx messages are passed through;
 * 5xx are not, since those are our problem to fix and not theirs to act on.
 */
export type GuestOrderOutcome =
  | { ok: true; order: GuestOrderResult }
  /** `stock` is set when the rejection was specifically an over-limit line, so the shopper
   *  can be told which product and how many are left rather than "something is unavailable". */
  | { ok: false; error?: string; stock?: InsufficientStock };

export type GuestOrderResult = {
  id: number;
  /** Unguessable handle for order tracking without an account. */
  publicToken?: string;
  /** Gateway redirect, when a card provider is active on the tenant. */
  paymentUrl?: string;
  /** Human-facing reference, when the API supplies one. */
  orderNumber?: string;
};

/**
 * EchoDesk understands two payment methods: `card` and `cash_on_delivery`.
 *
 * Our own enum is finer-grained because it grew around hand-rolled gateways. BOG and TBC both
 * collapse to `card` — the tenant, not us, decides which provider actually runs the charge.
 *
 * `bank_transfer` has no equivalent and is deliberately NOT silently folded into one of the
 * two: booking a card charge against someone who chose "I'll transfer you the money" takes
 * payment they didn't agree to. It returns null and the caller refuses the order instead.
 */
export function toEchoDeskPaymentMethod(
  method: ManualOrderInput["paymentMethod"],
): "card" | "cash_on_delivery" | null {
  switch (method) {
    case "cod":
      return "cash_on_delivery";
    case "bog_card":
    case "tbc_card":
      return "card";
    case "bank_transfer":
      return null;
  }
}

/** Cart lines carry EchoDesk gids; anything else can't be ordered through this backend. */
function toItems(lines: ManualOrderInput["lines"]) {
  const items: Array<{ product_id: number; quantity: number; variant_id?: number }> = [];
  for (const l of lines) {
    const ref = parseEchoDeskGid(l.variantId);
    // A line from the sample catalog has no EchoDesk id. Skipping it would silently ship a
    // cheaper order than the shopper agreed to, so refuse the whole thing instead.
    if (!ref) return null;
    if (ref.kind === "product") {
      items.push({ product_id: ref.id, quantity: l.quantity });
    } else {
      // A variant row still needs its parent product id, which the API resolves from the
      // variant — send both where we have them.
      items.push({ product_id: ref.id, quantity: l.quantity, variant_id: ref.id });
    }
  }
  return items;
}

export async function createGuestOrder(
  input: ManualOrderInput,
): Promise<GuestOrderOutcome> {
  if (!API_URL) return { ok: false };

  const items = toItems(input.lines);
  if (!items) {
    console.error("[echodesk/orders] cart contains non-EchoDesk lines — refusing to place order");
    return { ok: false };
  }

  const paymentMethod = toEchoDeskPaymentMethod(input.paymentMethod);
  if (!paymentMethod) {
    console.error(
      `[echodesk/orders] ${input.paymentMethod} has no EchoDesk equivalent — refusing rather than substituting a payment method the customer didn't choose`,
    );
    return { ok: false };
  }

  const body = {
    email: input.email,
    first_name: input.firstName,
    last_name: input.lastName,
    phone: input.phone,
    address: {
      address: input.address,
      city: input.city,
      label: "Delivery",
    },
    items,
    payment_method: paymentMethod,
    // Only sent when a configured flat method priced the delivery. A live courier quote has
    // no method id — EchoDesk prices that one itself from the same address.
    ...(input.shippingMethodId ? { shipping_method_id: input.shippingMethodId } : {}),
    ...(input.couponCode ? { promo_code: input.couponCode } : {}),
    // The map pin travels in the notes: guest checkout has no coordinate fields (see
    // lib/checkout/geo.ts), and a pin the courier can't see is a pin we didn't need.
    ...(() => {
      const notes = composeNotes(input.notes, input.lat, input.lng);
      return notes ? { notes } : {};
    })(),
  };

  const res = await fetch(`${API_URL}/api/ecommerce/client/guest-checkout/`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  if (!res.ok) {
    const raw = await res.text();
    console.error("[echodesk/orders] guest checkout rejected:", res.status, raw);
    if (res.status >= 400 && res.status < 500) {
      const message = (() => {
        try {
          const parsed = JSON.parse(raw) as { error?: string; detail?: string };
          return parsed.error ?? parsed.detail;
        } catch {
          return undefined;
        }
      })();
      return { ok: false, error: message, stock: parseInsufficientStock(message ?? raw) ?? undefined };
    }
    return { ok: false };
  }

  const json = (await res.json()) as {
    id?: number;
    public_token?: string;
    payment_url?: string;
    order_number?: string;
  };
  if (!json.id) {
    console.error("[echodesk/orders] guest checkout returned no order id:", JSON.stringify(json));
    return { ok: false };
  }

  return {
    ok: true,
    order: {
      id: json.id,
      publicToken: json.public_token,
      paymentUrl: json.payment_url,
      orderNumber: json.order_number,
    },
  };
}

/** Public order lookup for the tracking page — no account needed, the token is the credential. */
export async function getOrderByToken(token: string): Promise<Record<string, unknown> | null> {
  if (!API_URL || !token.trim()) return null;
  const res = await fetch(
    `${API_URL}/api/ecommerce/client/orders/by-token/?token=${encodeURIComponent(token)}`,
    { headers: { Accept: "application/json" }, cache: "no-store" },
  ).catch(() => null);
  if (!res || !res.ok) return null;
  return (await res.json().catch(() => null)) as Record<string, unknown> | null;
}
