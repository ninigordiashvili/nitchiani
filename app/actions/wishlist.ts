"use server";

import { getProductsByHandles } from "@/lib/shopify/client";
import type { Locale } from "@/lib/i18n/config";
import type { Product } from "@/lib/shopify/types";

/**
 * Hydrates wishlist handles (from client-side localStorage) into full product snapshots.
 *
 * The wishlist page used to fetch 50 products server-side and filter to 2–3 client-side —
 * a 95%+ waste of payload. This action fetches only what the user actually saved.
 */
export async function getWishlistProductsAction(
  handles: string[],
  locale: Locale,
): Promise<Product[]> {
  return getProductsByHandles(handles, locale);
}
