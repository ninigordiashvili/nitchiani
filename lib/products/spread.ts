import type { Product } from "../shopify/types";

/**
 * Reorders a catalogue so each category takes turns.
 *
 * EchoDesk returns products newest first, and the newest eleven are all braiding hair — so
 * the first screenful of the home page was braiding hair, and the bonnets, durags and care
 * products (half the shop) appeared only as category tiles. Dealing one product from each
 * category in turn puts the whole shop in the first eight cards.
 *
 * Within a category the original order is kept, so "newest first" still holds down each
 * column. Products with no category are a category of their own — last, but not dropped.
 */
export function spreadByCategory(products: Product[]): Product[] {
  const buckets = new Map<string, Product[]>();
  for (const p of products) {
    const key = p.productTypeHandle || "~uncategorised";
    const bucket = buckets.get(key);
    if (bucket) bucket.push(p);
    else buckets.set(key, [p]);
  }

  const out: Product[] = [];
  const lists = [...buckets.values()];
  for (let round = 0; out.length < products.length; round++) {
    for (const list of lists) {
      const next = list[round];
      if (next) out.push(next);
    }
  }
  return out;
}
