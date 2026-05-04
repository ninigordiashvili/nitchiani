import type { Locale } from "../i18n/config";
import { localizeProduct, type RawProduct } from "./dummy";
import type { Product } from "./types";

/**
 * Pure scoring function — assigns a relevance score to a single product against the user's query.
 * Both KA and EN copy are checked so a Georgian-speaking user can find a product by typing its
 * English name (and vice versa). Higher score = better match.
 *
 * Field weights (max one hit per field, even if both KA and EN match):
 *   title       +3
 *   productType +2
 *   tags        +2
 *   description +1
 *   handle      +1
 */
export function scoreProductForQuery(p: RawProduct, rawQuery: string): number {
  const query = rawQuery.toLowerCase().trim();
  if (!query) return 0;

  let score = 0;

  if (p.titleKa.toLowerCase().includes(query) || p.titleEn.toLowerCase().includes(query)) {
    score += 3;
  }
  if (
    p.productTypeKa.toLowerCase().includes(query) ||
    p.productTypeEn.toLowerCase().includes(query)
  ) {
    score += 2;
  }
  if (p.tags.some((t) => t.toLowerCase().includes(query))) {
    score += 2;
  }
  if (
    p.descriptionKa.toLowerCase().includes(query) ||
    p.descriptionEn.toLowerCase().includes(query)
  ) {
    score += 1;
  }
  if (p.handle.toLowerCase().includes(query)) {
    score += 1;
  }

  return score;
}

/**
 * Filters + ranks products against a query, returning the top `limit` localized for the active locale.
 * Returns an empty array for blank queries — callers can use that to render the empty state.
 *
 * When real Shopify is wired, swap this for a Storefront `predictiveSearch` query — the
 * (query, locale, limit) → Product[] contract stays the same.
 */
export function findMatchingProducts(
  products: RawProduct[],
  query: string,
  locale: Locale,
  limit = 8,
): Product[] {
  if (!query.trim()) return [];

  return products
    .map((p) => ({ p, score: scoreProductForQuery(p, query) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ p }) => localizeProduct(p, locale));
}
