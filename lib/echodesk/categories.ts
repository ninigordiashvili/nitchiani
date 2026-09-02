import { CATEGORY_HANDLES } from "../categories";

/**
 * Manual product → category mapping, keyed by EchoDesk product slug.
 *
 * EchoDesk has no categories endpoint and the tenant's `item-lists` are empty, so membership
 * is declared here. Its `attribute_values` are the eventual home for this — they're already
 * filterable — but the two attributes defined today have mismatched names, keys and types, so
 * nothing reliable can be derived from them yet.
 *
 * To place a product, add its slug with the handles it belongs to. Valid handles are the ones
 * in `lib/categories.ts`; an unlisted product still appears under All products (and Best
 * sellers when EchoDesk marks it featured) — it just won't show under a theme, which is the
 * honest default. A silent wrong guess is worse than a visible absence.
 */
export const PRODUCT_CATEGORIES: Record<string, string[]> = {
  // თმის ჟელე — a hair-care product (wax for braiding)
  "prod-001": ["hair-care"],
  // არიელი — synthetic braiding hair
  "prod-002": ["hair-extensions"],
  "prod-003": ["hair-extensions"],
  a: ["hair-extensions"],
};

export function categoriesFor(slug: string): string[] {
  return PRODUCT_CATEGORIES[slug] ?? [];
}

/** Guards against a typo silently hiding a product from its category. */
export function invalidCategoryHandles(): string[] {
  const valid = new Set(CATEGORY_HANDLES);
  return [...new Set(Object.values(PRODUCT_CATEGORIES).flat())].filter((h) => !valid.has(h));
}
