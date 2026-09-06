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
