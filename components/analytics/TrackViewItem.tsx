"use client";

import { useEffect } from "react";
import type { Product } from "@/lib/shopify/types";
import { CURRENCY, trackEvent } from "@/lib/analytics/ga";
import { gaItem } from "@/lib/analytics/items";
import { useCookieConsent } from "@/lib/ui/cookie-consent";

/**
 * GA4 `view_item` — once per product page view, as soon as analytics consent exists.
 * Depends on the consent decision so a visitor who accepts on this very page is counted too.
 */
export function TrackViewItem({ product }: { product: Product }) {
  const { decision } = useCookieConsent();

  useEffect(() => {
    if (decision !== "accepted") return;
    const item = gaItem(product);
    trackEvent("view_item", { currency: CURRENCY, value: item.price, items: [item] });
  }, [decision, product]);

  return null;
}
