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
export type GoneReason = "unavailable" | "soldOut";
export type GoneLine = { variantId: string; reason: GoneReason };
/** What the shop says is left of a line's variant right now. */
export type StockLine = { variantId: string; available: number };
export type CartCheck = { gone: GoneLine[]; stock: StockLine[] };

/** The gone lines alone — the shape this check had before it also reported stock. */
export async function findGoneLines(
  variantIds: string[],
  lookup: (productId: number) => Promise<ProductLookup>,
): Promise<GoneLine[]> {
  return (await checkCartLines(variantIds, lookup)).gone;
}

/**
 * Both halves of the same lookup: what has gone, and how much of the rest is left.
 *
 * The bag captured `maxQuantity` when the line was added and never refreshed it, so with the
 * one or two units this shop stocks, a bag left overnight routinely asked for more than
 * exists. EchoDesk refuses the whole order over it, at the last step, naming a limit the
 * shopper had never been shown.
 */
export async function checkCartLines(
  variantIds: string[],
  lookup: (productId: number) => Promise<ProductLookup>,
): Promise<CartCheck> {
  const refs = variantIds.map((variantId) => ({ variantId, ref: parseEchoDeskGid(variantId) }));

  const productIds = [
    ...new Set(refs.map((r) => r.ref?.productId).filter((id): id is number => typeof id === "number")),
  ];
  const products = new Map(
    await Promise.all(productIds.map(async (id) => [id, await lookup(id)] as const)),
  );

  const out: GoneLine[] = [];
  const stock: StockLine[] = [];
  const note = (variantId: string, available: number | undefined) => {
    // `undefined` is "this backend doesn't count stock", which is not a limit.
    if (typeof available === "number" && Number.isFinite(available)) {
      stock.push({ variantId, available });
    }
  };

  for (const { variantId, ref } of refs) {
    if (!ref) continue;
    // A variant saved before its parent was recorded can never be ordered.
    if (ref.productId === null) {
      out.push({ variantId, reason: "unavailable" });
      continue;
    }
    const product = products.get(ref.productId);
    if (product === null || product === undefined) continue;
    if (product === "missing" || (product.status && product.status !== "active")) {
      out.push({ variantId, reason: "unavailable" });
      continue;
    }
    if (ref.kind === "variant") {
      // Only judge a variant against a list we actually have.
      const variant = product.variants?.find((v) => v.id === ref.id);
      if (product.variants && !variant) out.push({ variantId, reason: "unavailable" });
      else if (variant && soldOut(variant.is_in_stock, variant.quantity))
        out.push({ variantId, reason: "soldOut" });
      else note(variantId, variant?.quantity);
      continue;
    }
    // Sold out since it went in the bag — EchoDesk refuses the whole order over one such
    // line, so the bag can't be left holding it.
    if (soldOut(product.is_in_stock, product.quantity)) out.push({ variantId, reason: "soldOut" });
    else note(variantId, product.quantity);
  }
  return { gone: out, stock };
}

/** Stock the backend doesn't track (both undefined) is never treated as sold out. */
function soldOut(inStock: boolean | undefined, quantity: number | undefined): boolean {
  if (inStock === false) return true;
  return quantity !== undefined && quantity <= 0;
}
