import type { Product } from "../shopify/types";
import { productHasAvailableVariant } from "./filter";

/**
 * Picks what to show in the cart's "You may like" and empty-cart rails.
 *
 * Out-of-stock products are dropped. Recommending something the shopper cannot buy wastes
 * the one slot we have to grow the order, and a card whose add button is disabled reads as
 * the shop being broken rather than the item being gone.
 *
 * Order is preserved, so whatever ranking the caller fetched still decides what leads.
 */
export function selectRecommendations(products: Product[], limit: number): Product[] {
  if (limit <= 0) return [];
  return products.filter(productHasAvailableVariant).slice(0, limit);
}

/**
 * How many to fetch to end up with `limit` after the out-of-stock ones are dropped.
 * Over-fetching keeps the rail full when part of the catalogue is sold out; the floor stops
 * a small `limit` asking for a pool too thin to survive any filtering at all.
 */
export function recommendationPoolSize(limit: number): number {
  return Math.max(limit * 3, 12);
}
