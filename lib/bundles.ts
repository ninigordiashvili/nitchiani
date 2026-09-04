/**
 * Curated product bundles surfaced on the homepage. Each bundle ties a small set of product
 * handles to a coupon in `lib/cart/coupons.ts` so the visible "save ₾X" maths is a real
 * end-to-end discount, not a marketing illusion.
 *
 * `affinityTypes` is a list of `productTypeHandle` values the bundle targets — used by the
 * client-side picker on the homepage to surface the bundle that best matches the user's
 * recent browsing. Falls back to the first bundle when there's no signal.
 *
 * Replace this registry with a CMS / Shopify metaobject when there are more than a handful
 * of bundles to manage.
 */

export type Bundle = {
  id: string;
  handles: string[];
  /**
   * Set for a "buy N of one product" offer rather than "one of each". The picker then adds
   * `minQuantity` of a single product from `handles` instead of one of every handle, and the
   * saving is computed against that quantity.
   */
  minQuantity?: number;
  titleEn: string;
  titleKa: string;
  taglineEn: string;
  taglineKa: string;
  /** Coupon code from `lib/cart/coupons.ts` that auto-applies when the user adds the bundle. */
  couponCode: string;
  /** `productTypeHandle` values this bundle targets. Slug-form, lowercase, hyphenated. */
  affinityTypes: string[];
};

export const BUNDLES: Bundle[] = [
  {
    id: "ariel-3",
    // Both Ariel listings, so the offer stands whichever one a shopper is looking at.
    handles: ["prod-002", "a"],
    minQuantity: 3,
    titleEn: "3 Ariel hair — save ₾15",
    titleKa: "3 არიელი - ხელოვნური თმა — დაზოგე ₾15",
    taglineEn: "Enough for a full head, at a better price per pack.",
    taglineKa: "საკმარისი სრული თავისთვის, უკეთეს ფასად შეკვრაზე.",
    couponCode: "ARIEL15",
    affinityTypes: ["hair-extensions"],
  },
];

export function getFeaturedBundle(): Bundle | null {
  return BUNDLES[0] ?? null;
}

/**
 * Pick the best-fit bundle based on a list of `productTypeHandle` values the user has
 * recently engaged with. Score = number of recent types that intersect each bundle's
 * affinity list; highest score wins. Ties fall back to declaration order so the registry
 * order doubles as a tiebreaker for "preferred default".
 *
 * Returns the first bundle when no recent-type signal exists, so first-time visitors and
 * users with cleared localStorage still see *something*.
 */
export function pickBundleForRecentTypes(
  recentTypes: readonly string[],
  bundles: readonly Bundle[],
): Bundle | null {
  if (bundles.length === 0) return null;
  if (recentTypes.length === 0) return bundles[0];

  const recentSet = new Set(recentTypes.map((t) => t.toLowerCase()));
  let best = bundles[0];
  let bestScore = 0;
  for (const b of bundles) {
    const score = b.affinityTypes.reduce(
      (acc, t) => acc + (recentSet.has(t.toLowerCase()) ? 1 : 0),
      0,
    );
    if (score > bestScore) {
      bestScore = score;
      best = b;
    }
  }
  return best;
}

/** Just enough of a cart line to judge eligibility, so this file needn't know the cart. */
type CountableLine = { productHandle: string; quantity: number };

/** The bundle a coupon belongs to, or null for a plain code with no quantity condition. */
export function bundleForCoupon(code: string): Bundle | null {
  const canonical = code.trim().toUpperCase();
  return BUNDLES.find((b) => b.couponCode.toUpperCase() === canonical) ?? null;
}

/** Units of the bundle's products currently in the bag, across all of its handles. */
export function bundleUnitsInCart(bundle: Bundle, lines: CountableLine[]): number {
  return lines
    .filter((l) => bundle.handles.includes(l.productHandle))
    .reduce((sum, l) => sum + l.quantity, 0);
}

/**
 * How many more units the offer still needs. Zero when it is satisfied — and zero for a
 * bundle with no `minQuantity`, which is a "one of each" offer rather than a "buy N".
 *
 * This counts packs rather than money on purpose. Pricing the offer as a minimum spend was a
 * proxy that broke in both directions: three packs stop qualifying the moment they go on
 * sale, and any ₾240 of unrelated products start qualifying without a single pack in the bag.
 */
export function bundleShortfall(bundle: Bundle, lines: CountableLine[]): number {
  if (!bundle.minQuantity) return 0;
  return Math.max(0, bundle.minQuantity - bundleUnitsInCart(bundle, lines));
}
