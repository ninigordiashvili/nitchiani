/**
 * Manual product → category mapping.
 *
 * EchoDesk has no categories endpoint and the tenant's `item-lists` are empty, so the themed
 * collections (bonnets, loc care, extensions, …) have nothing in the API to match on. Until
 * products carry a category attribute, membership is declared here by product slug.
 *
 * To place a new product, add its slug with the collection handles it belongs to. A product
 * that isn't listed still appears in "All products" (and in "Best sellers" when EchoDesk marks
 * it featured) — it just won't show under a themed category, which is the honest default: a
 * silent wrong guess is worse than an absence you can see.
 *
 * Valid handles are the collection shells in `lib/shopify/dummy.ts`:
 *   bonnets · loc-care · extensions · accessories · tools · piercings
 * ("all-products", "best-sellers" and "new-arrivals" are derived, so don't list them here.)
 */
export const PRODUCT_CATEGORIES: Record<string, string[]> = {
  // თმის ჟელე — hair wax for braiding
  "prod-001": ["loc-care"],
  // არიელი — synthetic hair for braids
  "prod-002": ["extensions"],
  "prod-003": ["extensions"],
  a: ["extensions"],
};

/** Collection handles whose membership is derived from the API, not declared above. */
export const DERIVED_COLLECTIONS = new Set(["all-products", "best-sellers", "new-arrivals"]);

export function categoriesFor(slug: string): string[] {
  return PRODUCT_CATEGORIES[slug] ?? [];
}
