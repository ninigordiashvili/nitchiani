import { parseEchoDeskGid } from "./adapt";
import type { EchoDeskProduct } from "./types";

/**
 * What a product lookup can say. `"missing"` is the backend telling us the product is gone;
 * `null` is not knowing — the request failed — and must never be read as "gone", or a
 * network blip would empty a shopper's bag.
 */
export type ProductLookup = EchoDeskProduct | "missing" | null;

/**
 * Which bag lines name something the shop no longer sells.
 *
 * The bag lives in the browser and outlives catalogue edits: a product deleted and recreated
 * under a new id still sits in the bag with its old id, name and picture, looks perfectly
 * normal, and fails only at the last step of checkout. Checking on load moves that failure to
 * the moment the shopper opens the bag, where removing the line costs them nothing.
 *
 * Lines that aren't EchoDesk's are left alone — they're not this check's to judge. Only a
 * definite answer removes anything.
 */
export async function findGoneLines(
  variantIds: string[],
  lookup: (productId: number) => Promise<ProductLookup>,
): Promise<string[]> {
  const refs = variantIds.map((variantId) => ({ variantId, ref: parseEchoDeskGid(variantId) }));

  const productIds = [
    ...new Set(refs.map((r) => r.ref?.productId).filter((id): id is number => typeof id === "number")),
  ];
  const products = new Map(
    await Promise.all(productIds.map(async (id) => [id, await lookup(id)] as const)),
  );

  return refs
    .filter(({ ref }) => {
      if (!ref) return false;
      // A variant saved before its parent was recorded can never be ordered.
      if (ref.productId === null) return true;
      const product = products.get(ref.productId);
      if (product === null || product === undefined) return false;
      if (product === "missing") return true;
      if (product.status && product.status !== "active") return true;
      // Only judge a variant against a list we actually have.
      if (ref.kind === "variant" && product.variants) {
        return !product.variants.some((v) => v.id === ref.id);
      }
      return false;
    })
    .map(({ variantId }) => variantId);
}
