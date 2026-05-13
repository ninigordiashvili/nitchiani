/**
 * Curated product bundles surfaced on the homepage. Each bundle ties a small set of product
 * handles to a coupon in `lib/cart/coupons.ts` so the visible "save ₾X" maths is a real
 * end-to-end discount, not a marketing illusion.
 *
 * Replace with a CMS / Shopify metaobject when there are more than 1–2 bundles to manage.
 */

export type Bundle = {
  id: string;
  handles: string[];
  titleEn: string;
  titleKa: string;
  taglineEn: string;
  taglineKa: string;
  /** Coupon code from `lib/cart/coupons.ts` that auto-applies when the user adds the bundle. */
  couponCode: string;
};

export const BUNDLES: Bundle[] = [
  {
    id: "loc-start",
    handles: ["loc-care-oil-15ml", "wood-loc-pick", "loc-detox-rinse"],
    titleEn: "Loc starter kit",
    titleKa: "ლოკსების სტარტერ ნაკრები",
    taglineEn: "Three essentials to begin your loc journey, together for less.",
    taglineKa: "სამი აუცილებელი ნივთი ლოკსების სამოგზაუროდ, ერთად უფრო იაფად.",
    couponCode: "LOCSTART15",
  },
];

export function getFeaturedBundle(): Bundle | null {
  return BUNDLES[0] ?? null;
}
