"use server";

import { resolveShipping, type ShippingResolution } from "@/lib/echodesk/shipping";
import type { Locale } from "@/lib/i18n/config";

/**
 * Prices delivery for the checkout summary.
 *
 * A server action rather than a direct call from the browser so the quote goes out from one
 * place — the same code the order route charges from, so the estimate and the charge can't
 * drift apart in how they read the tenant's configuration.
 *
 * Returns null whenever delivery can't be priced, which is the normal state today: the
 * summary then shows no delivery line and the shopper is charged for goods only.
 */
export async function getShippingQuoteAction(
  locale: Locale,
  subtotal: number,
  address: { street: string; city: string; lat?: number; lng?: number },
  items: { productId: number; quantity: number }[],
): Promise<ShippingResolution> {
  if (!address.street.trim() || !address.city.trim()) return { status: "unpriced" };
  return resolveShipping(locale, subtotal, { ...address, items });
}
