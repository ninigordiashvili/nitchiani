"use server";

import { searchProducts } from "@/lib/shopify/client";
import type { Locale } from "@/lib/i18n/config";
import type { Product } from "@/lib/shopify/types";

/**
 * Server action invoked by the SearchOverlay. Wraps the Shopify client search getter so the
 * client component never imports the dummy data layer (smaller client bundle, also keeps the
 * future real-Shopify swap a one-line change in lib/shopify/client.ts).
 */
export async function searchAction(query: string, locale: Locale): Promise<Product[]> {
  return searchProducts(query, locale, 8);
}
