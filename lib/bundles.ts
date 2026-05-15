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
    id: "loc-start",
    handles: ["loc-care-oil-15ml", "wood-loc-pick", "loc-detox-rinse"],
    titleEn: "Loc starter kit",
    titleKa: "ლოკსების სტარტერ ნაკრები",
    taglineEn: "Three essentials to begin your loc journey, together for less.",
    taglineKa: "სამი აუცილებელი ნივთი ლოკსების სამოგზაუროდ, ერთად უფრო იაფად.",
    couponCode: "LOCSTART15",
    affinityTypes: ["loc-care", "tools"],
  },
  {
    id: "overnight-care",
    handles: ["silk-bonnet-noir", "satin-pillowcase-cream", "edge-control-mini"],
    titleEn: "Overnight care set",
    titleKa: "ღამის მოვლის ნაკრები",
    taglineEn: "Silk, satin and hold — three pieces that keep your hair in shape overnight.",
    taglineKa: "აბრეშუმი, სატენი და დაცვა — სამი ნივთი თმის ღამის მოვლისთვის.",
    couponCode: "OVERNIGHT15",
    affinityTypes: ["bonnets", "accessories"],
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
