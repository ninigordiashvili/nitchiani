import { discountFor, findCoupon, type Coupon } from "@/lib/cart/coupons";

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
