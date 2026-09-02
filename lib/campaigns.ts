/**
 * Curated campaign landing pages. Different from `Collection` — campaigns mix products
 * across categories under a single editorial banner + tagline. Linked from places like
 * Instagram bio, paid ads, newsletter sends.
 *
 * Lives in the same `/shop/<slug>` URL space as collections. The route handler in
 * `app/[locale]/(shop)/shop/[collection]/page.tsx` checks campaigns first and falls
 * through to collections if no match — so campaign slugs must NOT collide with collection
 * handles (`new-arrivals`, `bonnets`, `hair-care`, `hair-extensions`,
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

export const CAMPAIGNS: Campaign[] = [
  {
    slug: "spring-drop-26",
    titleEn: "Spring drop · 2026",
    titleKa: "გაზაფხულის კოლექცია · 2026",
    eyebrowEn: "Limited",
    eyebrowKa: "შეზღუდული",
    taglineEn:
      "Three new pieces in soft maroon, hand-prepared this week in our Tbilisi studio.",
    taglineKa:
      "სამი ახალი ნივთი რბილ მაროუნში, ხელით მზადდება ამ კვირაში თბილისის სტუდიოში.",
    bannerImage: "/banners/new-drop.png",
    handles: ["silk-bonnet-noir", "satin-pillowcase-cream", "gold-loc-cuff-set"],
  },
];

export function getCampaignBySlug(slug: string): Campaign | null {
  return CAMPAIGNS.find((c) => c.slug === slug) ?? null;
}
