"use client";

import { useMemo } from "react";
import { type Bundle, pickBundleForRecentTypes } from "@/lib/bundles";
import { useRecentlyViewed } from "@/lib/recently-viewed/store";
import type { Product } from "@/lib/shopify/types";
import { BundleUpsell } from "./BundleUpsell";

/**
 * Client wrapper around `BundleUpsell`. Reads the user's recently-viewed `productTypeHandle`
 * values and asks `pickBundleForRecentTypes` which of the pre-fetched bundles fits best.
 *
 * Server pre-fetches *every* candidate bundle's products in parallel (see the homepage
 * page.tsx), so the swap is free on the client — no extra round-trips, no loading flash
 * beyond the brief moment between SSR (default bundle) and hydration (matched bundle) for
 * users with browsing history. Visual layout is identical across bundles so the swap
 * doesn't shift surrounding content.
 */
export function BundleUpsellPicker({
  bundlesWithProducts,
}: {
  bundlesWithProducts: { bundle: Bundle; products: Product[] }[];
}) {
  const { items } = useRecentlyViewed();

  const selected = useMemo(() => {
    if (bundlesWithProducts.length === 0) return null;
    const recentTypes = items
      .map((i) => i.productTypeHandle)
      .filter((t): t is string => Boolean(t));
    const bundles = bundlesWithProducts.map((bp) => bp.bundle);
    const picked = pickBundleForRecentTypes(recentTypes, bundles);
    if (!picked) return null;
    return bundlesWithProducts.find((bp) => bp.bundle.id === picked.id) ?? null;
  }, [items, bundlesWithProducts]);

  if (!selected) return null;

  return <BundleUpsell bundle={selected.bundle} products={selected.products} />;
}
