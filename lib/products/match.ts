import type { Product } from "../shopify/types";

/**
 * How well a product answers what the shopper typed. 0 means "don't show it".
 *
 * Two tiers on purpose. Nearly every description in this catalogue contains "თმა", so a
 * product whose *name* or category matches has to outrank one that merely mentions the word
 * in a paragraph — otherwise the first result for "ბონეტი" is a braiding-hair product whose
 * copy says bonnets are sold separately.
 */
export function scoreForQuery(product: Product, query: string): number {
  const q = query.trim().toLowerCase();
  if (!q) return 0;

  const haystack = product.searchText ?? product.title.toLowerCase();
  // Georgian inflects: a shopper types "ბონეტი", the word indexed is "ბონეტ". A plain
  // substring test only catches longer-contains-shorter, so compare word by word in both
  // directions and let either prefix win. Four characters, so short words don't match noise.
  const named =
    haystack.includes(q) ||
    haystack
      .split(/\s+/)
      .some((term) => term.length >= 4 && (term.startsWith(q) || q.startsWith(term)));
  if (named) return 2;

  const body = `${product.shortDescription ?? ""} ${product.description}`.toLowerCase();
  return body.includes(q) ? 1 : 0;
}
