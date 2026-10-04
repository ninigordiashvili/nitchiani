/**
 * Curated campaign landing pages. Different from `Collection` — campaigns mix products
 * across categories under a single editorial banner + tagline. Linked from places like
 * Instagram bio, paid ads, newsletter sends.
 *
 * Lives in the same `/shop/<slug>` URL space as collections. The route handler in
 * `app/[locale]/(shop)/shop/[collection]/page.tsx` checks campaigns first and falls
 * through to collections if no match — so campaign slugs must NOT collide with collection
 * handles (`bonnets`, `hair-care`, `hair-extensions`,
 * `accessories`, `tools`).
 *
 * When this grows past a handful, move to a CMS / Shopify metaobject. For now: hand-edited
 * registry, redeploy to ship a new campaign.
 */

export type Campaign = {
  slug: string;
  titleEn: string;
  titleKa: string;
  taglineEn: string;
  taglineKa: string;
  eyebrowEn?: string;
  eyebrowKa?: string;
  /** Hero banner image — full-bleed at the top of the page. */
  bannerImage: string;
  /** Curated product handles, in display order. */
  handles: string[];
  /** Optional coupon code (from `lib/cart/coupons.ts`) surfaced as a banner on the page. */
  couponCode?: string;
};

// None running. The old "spring drop" entry pointed at sample-catalogue products that were
// never in EchoDesk, so its page could only ever be empty; add real campaigns here.
export const CAMPAIGNS: Campaign[] = [];

export function getCampaignBySlug(slug: string): Campaign | null {
  return CAMPAIGNS.find((c) => c.slug === slug) ?? null;
}
