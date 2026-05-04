"use server";

import { getBestSellers } from "@/lib/shopify/client";
import type { Locale } from "@/lib/i18n/config";
import type { Product } from "@/lib/shopify/types";

/**
 * Returns up to N best-selling products for the current locale. Used by the empty-cart
 * recommendations grid (cart drawer + cart page) and could be reused for empty-wishlist later.
 *
 * Wrapped as a server action so the dummy data layer (eventually a real Storefront API call)
 * stays out of the client bundle.
 */
export async function getBestSellersAction(locale: Locale, limit = 4): Promise<Product[]> {
  return getBestSellers(locale, limit);
}
