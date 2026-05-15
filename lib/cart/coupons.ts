/**
 * Demo coupon registry. Replace with a server-side discount lookup (Shopify Discount Codes
 * API or our own table) once the merchant tooling exists — keep `findCoupon` async-compatible
 * so the swap is mechanical.
 *
 * All comparisons are GEL-denominated; the cart's transaction currency is GEL.
 */

export type Coupon = {
  code: string;
  type: "percent" | "amount";
  /** % for percent type, GEL amount for amount type. */
  value: number;
  /** Minimum subtotal in GEL for the coupon to take effect. */
  minSubtotal?: number;
};

export type CouponError = "invalid" | "minimum";

const COUPONS: Coupon[] = [
  { code: "WELCOME10", type: "percent", value: 10 },
  { code: "GEORGIA20", type: "amount", value: 20, minSubtotal: 100 },
  { code: "FRIDAY15", type: "percent", value: 15, minSubtotal: 80 },
  // Auto-applied by the homepage bundle CTAs. Paired with `lib/bundles.ts`.
  { code: "LOCSTART15", type: "percent", value: 15 },
  { code: "OVERNIGHT15", type: "percent", value: 15 },
];

/** Case-insensitive lookup. Returns null if no match. */
export function findCoupon(code: string): Coupon | null {
  const canonical = code.trim().toUpperCase();
  if (!canonical) return null;
  return COUPONS.find((c) => c.code === canonical) ?? null;
}

/** GEL discount for a given subtotal. Returns 0 when the minimum-subtotal gate isn't met. */
export function discountFor(subtotal: number, coupon: Coupon): number {
  if (coupon.minSubtotal && subtotal < coupon.minSubtotal) return 0;
  const raw =
    coupon.type === "percent"
      ? subtotal * (coupon.value / 100)
      : Math.min(coupon.value, subtotal);
  return Math.round(raw * 100) / 100;
}

/** Short visual label, e.g. `−10%` or `−₾20`. */
export function couponLabel(coupon: Coupon): string {
  return coupon.type === "percent" ? `−${coupon.value}%` : `−₾${coupon.value}`;
}
