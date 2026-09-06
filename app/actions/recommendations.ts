"use server";

import { getProducts } from "@/lib/shopify/client";
import {
  recommendationPoolSize,
  selectRecommendations,
} from "@/lib/products/recommendations";
import type { Locale } from "@/lib/i18n/config";
import type { Product } from "@/lib/shopify/types";

/**
 * Returns up to N recommendable products for the current locale. Used by the cart's "You may
 * like" rail and the empty-cart grid (drawer + page), and could be reused for empty-wishlist.
 *
 * Never returns anything out of stock — see `selectRecommendations`.
 *
 * Wrapped as a server action so the dummy data layer (eventually a real Storefront API call)
 * stays out of the client bundle.
 */
export async function getRecommendedProductsAction(
  locale: Locale,
  limit = 4,
): Promise<Product[]> {
  // Was the best-sellers collection, which is gone. Catalog order is the honest replacement:
  // with every product flagged featured, "best sellers" was already just the catalog wearing
  // a different name.
  //
  // Fetch wider than we need so dropping the sold-out ones still fills the rail.
  const pool = await getProducts(locale, recommendationPoolSize(limit));
  return selectRecommendations(pool, limit);
}
