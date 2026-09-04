import { bundleForCoupon, bundleShortfall } from "@/lib/bundles";
import { discountFor, findCoupon, type Coupon } from "@/lib/cart/coupons";
import { classifyPromoMessage, validatePromo } from "@/lib/echodesk/promo";

/**
 * Errors are returned as stable keys (e.g. `promoInvalid`), not sentences — the client
 * translates them so a Georgian shopper reads Georgian.
 *
 * Server-authoritative order totals. Never trust client-supplied subtotal/total/discount —
 * a DevTools user can edit the request before it leaves the browser. We recompute everything
 * from the line items + coupon registry. Kept in its own module (not inline in the route) so
 * the money math is unit-testable without spinning up the HTTP handler.
 *
 * All amounts are GEL (the storefront's transaction currency).
 */
export type ServerComputedTotals = {
  subtotal: number;
  discount: number;
  total: number;
  coupon: Coupon | null;
};

/** Minimal shape `computeTotals` needs from a cart line — a superset of the checkout line schema. */
export type TotalsLine = {
  unitPrice: { amount: string };
  quantity: number;
  /** Needed to judge a "buy N of this product" offer. */
  productHandle?: string;
};

/**
 * Whether a "buy N" offer's condition is met by these lines.
 *
 * Enforced here as well as in the cart because this is where the charge is decided. EchoDesk
 * knows the code but not that it is a three-pack offer — its own rule is a minimum spend at
 * best — so without this the server would grant a discount the cart has already withdrawn,
 * and the shopper would be charged something different from what they were shown.
 */
function bundleConditionMet(lines: TotalsLine[], code: string): boolean {
  const bundle = bundleForCoupon(code);
  if (!bundle) return true;
  const countable = lines.map((l) => ({
    productHandle: l.productHandle ?? "",
    quantity: l.quantity,
  }));
  return bundleShortfall(bundle, countable) === 0;
}

export function computeTotals(
  lines: TotalsLine[],
  couponCode: string | null | undefined,
): { ok: true; totals: ServerComputedTotals } | { ok: false; error: string } {
  const subtotal = lines.reduce(
    (sum, l) => sum + Number.parseFloat(l.unitPrice.amount) * l.quantity,
    0,
  );

  if (!Number.isFinite(subtotal) || subtotal <= 0) {
    return { ok: false, error: "invalidSubtotal" };
  }

  let coupon: Coupon | null = null;
  let discount = 0;
  if (couponCode) {
    coupon = findCoupon(couponCode);
    if (!coupon) {
      return { ok: false, error: "promoInvalid" };
    }
    // `discountFor` returns 0 when the min-subtotal gate fails, and the bundle check does
    // the same when the offer's pack count isn't met. Either way the coupon stays attached
    // to the order for analytics, but the charge is the full subtotal.
    discount = bundleConditionMet(lines, couponCode) ? discountFor(subtotal, coupon) : 0;
  }

  const total = Math.max(0, Math.round((subtotal - discount) * 100) / 100);
  return { ok: true, totals: { subtotal, discount, total, coupon } };
}

/**
 * Totals when EchoDesk owns the catalog.
 *
 * Identical to `computeTotals` for the subtotal — that's still recomputed from the line items
 * and never taken from the client — but the discount comes from EchoDesk rather than the local
 * registry, because EchoDesk's guest checkout applies `promo_code` itself and charges the
 * total it computes. Discounting from two different rule sets would show the shopper one price
 * and take another.
 *
 * A validation failure (network, 5xx) refuses the order instead of falling back to full price:
 * silently dropping a discount the shopper was promised is a worse outcome than asking them to
 * try again.
 */
export async function computeTotalsWithEchoDesk(
  lines: TotalsLine[],
  couponCode: string | null | undefined,
): Promise<{ ok: true; totals: ServerComputedTotals } | { ok: false; error: string }> {
  const base = computeTotals(lines, null);
  if (!base.ok) return base;

  const code = couponCode?.trim();
  if (!code) return base;

  const result = await validatePromo(code, base.totals.subtotal);
  if (!result) {
    return { ok: false, error: "promoUnavailable" };
  }
  if (!result.valid) {
    // Classified, not passed through: the backend writes English and the client translates.
    const reason = classifyPromoMessage(result.message);
    return { ok: false, error: reason === "minimum" ? "promoMinimum" : "promoInvalid" };
  }

  const discount = bundleConditionMet(lines, code)
    ? Math.min(result.discountAmount ?? 0, base.totals.subtotal)
    : 0;
  const total = Math.max(0, Math.round((base.totals.subtotal - discount) * 100) / 100);
  return {
    ok: true,
    totals: {
      subtotal: base.totals.subtotal,
      discount,
      total,
      // The registry entry is only used for display/analytics; the money came from EchoDesk.
      coupon: findCoupon(code) ?? { code: code.toUpperCase(), type: "amount", value: discount },
    },
  };
}