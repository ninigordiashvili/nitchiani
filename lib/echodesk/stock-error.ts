/**
 * Reads the stock complaint out of an EchoDesk rejection.
 *
 * The backend answers an over-limit order with a Django REST error whose payload is a Python
 * repr, e.g.
 *
 *   {"error": "[ErrorDetail(string='Insufficient stock for არიელი - ხელოვნური თმა.
 *              Available: 1, Requested: 2', code='invalid')]"}
 *
 * We translate that into our own sentence rather than showing it: the wrapper is debug
 * output, the sentence is English regardless of the shopper's language, and the shape is the
 * backend's to change. Only the product name and the number left are worth keeping — enough
 * to tell someone exactly what to fix.
 */
export type InsufficientStock = {
  /** Product name as the backend knows it — already in the shop's own language. */
  product: string;
  /** Units the shop can actually ship. */
  available: number;
};

/**
 * Anchored on ". Available:" rather than matching greedily, so a product name containing a
 * full stop ("Ariel 2.0") survives intact.
 */
const PATTERN = /Insufficient stock for\s+(.+?)\.\s*Available:\s*(\d+)/i;

export function parseInsufficientStock(raw: string | undefined): InsufficientStock | null {
  if (!raw) return null;
  const match = PATTERN.exec(raw);
  if (!match) return null;

  const product = match[1].trim();
  const available = Number.parseInt(match[2], 10);
  if (!product || !Number.isFinite(available) || available < 0) return null;

  return { product, available };
}
