/**
 * Stock ceilings for the bag.
 *
 * EchoDesk enforces these at checkout — "Insufficient stock for X. Available: 1, Requested:
 * 2" — and rejects the whole order. Discovering that after the delivery address and payment
 * method are filled in is the worst possible moment, so the storefront holds the same line
 * up front and the bag simply never exceeds what the shop can ship.
 */

/**
 * Clamp a requested quantity to what's actually available.
 *
 * `max` of `undefined` means the backend doesn't track stock for this line — no ceiling.
 * Distinguishing that from `0` matters: treating untracked as zero would make every
 * untracked product unbuyable.
 */
export function clampToStock(requested: number, max: number | undefined): number {
  if (requested <= 0) return 0;
  if (max === undefined || !Number.isFinite(max)) return requested;
  return Math.max(0, Math.min(requested, Math.floor(max)));
}

/** True when the line is already holding every unit the shop has. */
export function isAtStockLimit(quantity: number, max: number | undefined): boolean {
  if (max === undefined || !Number.isFinite(max)) return false;
  return quantity >= Math.floor(max);
}

/**
 * At or below this many units, the product page and cards say how many are left.
 *
 * Only the last piece is called out. Most of the catalogue holds two or three of each item,
 * so a higher line put the warning on nearly every card, where it stopped meaning anything.
 */
export const LOW_STOCK_THRESHOLD = 1;

/**
 * How many are left, when it's few enough to say so; null otherwise. Untracked stock
 * (`undefined`) and sold-out (0) never warn — sold out has its own state.
 */
export function lowStockCount(available: number | undefined): number | null {
  if (available === undefined || !Number.isFinite(available)) return null;
  const left = Math.floor(available);
  return left > 0 && left <= LOW_STOCK_THRESHOLD ? left : null;
}

/** Units left across a product's variants that are on sale; undefined if any is untracked. */
export function unitsLeft(variants: { availableForSale: boolean; quantityAvailable?: number }[]): number | undefined {
  const onSale = variants.filter((v) => v.availableForSale);
  if (onSale.some((v) => v.quantityAvailable === undefined)) return undefined;
  return onSale.reduce((sum, v) => sum + (v.quantityAvailable ?? 0), 0);
}
