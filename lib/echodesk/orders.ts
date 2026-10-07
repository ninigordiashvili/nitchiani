import { isUsableCoordinate } from "../checkout/geo";
import { type InsufficientStock, parseInsufficientStock, parseMissingProduct } from "./stock-error";
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
  | {
      ok: false;
      error?: string;
      stock?: InsufficientStock;
      /** EchoDesk id of a product the backend no longer sells — deleted or switched off. */
      missingProductId?: number;
    };

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
    // A line from the sample catalog has no EchoDesk id, and a variant saved without its
    // parent has no product to name. Skipping either would silently ship a cheaper order than
    // the shopper agreed to, so refuse the whole thing instead.
    if (!ref || ref.productId === null) return null;
    if (ref.kind === "product") {
      items.push({ product_id: ref.productId, quantity: l.quantity });
    } else {
      // Both ids: `product_id` is the parent, `variant_id` the size or colour within it.
      // Sending the variant id as `product_id` named some unrelated product — or none.
      items.push({ product_id: ref.productId, quantity: l.quantity, variant_id: ref.id });
    }
  }
  return items;
}

/**
 * The courier the shopper picked, as the order's `quickshipper_*` fields.
 *
 * All or nothing: the provider id alone books a company without saying which of its tiers,
 * and Go Delivery is quoted as scooter, car and truck under one id at three prices. Without
 * the fee id EchoDesk would pick for us, so a partial choice is not sent at all.
 *
 * `quickshipper_parcel_dimensions_id` is deliberately omitted — QuickShipper returns it as
 * null on every option we've seen, and inventing a value would describe a parcel we haven't
 * measured. It is nullable on the request, so leaving it out is the honest answer.
 */
function quickShipperFields(input: ManualOrderInput, pickup: boolean) {
  // Nobody is delivering a collection order, so there is no courier to book.
  if (pickup) return {};
  if (input.courierId === undefined || !input.courierFeeId) return {};

  return {
    quickshipper_provider_id: input.courierId,
    quickshipper_provider_fee_id: input.courierFeeId,
    ...(input.courierName ? { quickshipper_provider_name: input.courierName } : {}),
    // A decimal string, not a number: the field is `format: decimal` with at most two
    // places, and posting 8.010000000000001 is rejected by the pattern.
    ...(typeof input.courierPrice === "number" && Number.isFinite(input.courierPrice)
      ? { quickshipper_price: input.courierPrice.toFixed(2) }
      : {}),
  };
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

  const notes = input.notes?.trim();
  const pickup = input.pickup === true;

  const body = {
    email: input.email,
    first_name: input.firstName,
    last_name: input.lastName,
    phone: input.phone,
    address: {
      address: input.address,
      city: input.city,
      label: pickup ? "Pickup" : "Delivery",
      // The map pin, as coordinates rather than as a link in the notes. Only sent when both
      // halves are real — see isUsableCoordinate — because the backend quotes and dispatches
      // against these, and a zeroed pair would send a courier to the Gulf of Guinea.
      ...(isUsableCoordinate(input.lat, input.lng)
        ? { latitude: input.lat, longitude: input.lng }
        : {}),
    },
    items,
    payment_method: paymentMethod,
    // The bank the shopper picked. Card only: EchoDesk ignores it for cash on delivery, and
    // leaving it out falls back to the shop's default bank.
    ...(paymentMethod === "card" && input.paymentProvider
      ? { payment_provider: input.paymentProvider }
      : {}),
    // Collection at the store is a first-class choice on the order now, not a note somebody
    // has to read: the back office sees a pickup order and no courier is dispatched.
    delivery_method: pickup ? "pickup" : "courier",
    // Only sent when a configured flat method priced the delivery. A live courier quote has
    // no method id — EchoDesk prices that one itself from the same address.
    ...(input.shippingMethodId ? { shipping_method_id: input.shippingMethodId } : {}),
    ...(input.couponCode ? { promo_code: input.couponCode } : {}),
    ...quickShipperFields(input, pickup),
    // Sent as its own field, not folded into `notes`: the back office has to be able to see
    // whether this customer may be marketed to without reading prose, and the notes field is
    // the customer's words. If EchoDesk ignores unknown keys this is a no-op there, which is
    // why the consent is also recorded by subscribing them in /api/checkout/initiate — that
    // path is the durable, dated record we control.
    marketing_consent: input.marketingConsent === true,
    // Whatever the customer typed, and nothing else.
    ...(notes ? { notes } : {}),
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
      return {
        ok: false,
        error: message,
        stock: parseInsufficientStock(message ?? raw) ?? undefined,
        missingProductId: parseMissingProduct(message ?? raw) ?? undefined,
      };
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
