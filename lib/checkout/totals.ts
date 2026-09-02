import { discountFor, findCoupon, type Coupon } from "@/lib/cart/coupons";
import { validatePromo } from "@/lib/echodesk/promo";

/**
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
};

export function computeTotals(
  lines: TotalsLine[],
  couponCode: string | null | undefined,
): { ok: true; totals: ServerComputedTotals } | { ok: false; error: string } {
  const subtotal = lines.reduce(
    (sum, l) => sum + Number.parseFloat(l.unitPrice.amount) * l.quantity,
    0,
  );

  if (!Number.isFinite(subtotal) || subtotal <= 0) {
    return { ok: false, error: "Invalid subtotal" };
  }

  let coupon: Coupon | null = null;
  let discount = 0;
  if (couponCode) {
    coupon = findCoupon(couponCode);
    if (!coupon) {
      return { ok: false, error: "Coupon code is not valid." };
    }
    discount = discountFor(subtotal, coupon);
    // `discountFor` returns 0 when the min-subtotal gate fails — we still keep the coupon
    // attached to the order for analytics, but the charge is the full subtotal.
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
    return { ok: false, error: "Could not check that promo code. Please try again." };
  }
  if (!result.valid) {
    return { ok: false, error: result.message || "Coupon code is not valid." };
  }

  const discount = Math.min(result.discountAmount ?? 0, base.totals.subtotal);
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