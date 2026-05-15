"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { getWishlistProductsAction } from "@/app/actions/wishlist";
import { ProductGrid } from "@/components/commerce/ProductGrid";
import { Link } from "@/lib/i18n/routing";
import type { Locale } from "@/lib/i18n/config";
import type { Product } from "@/lib/shopify/types";
import { useWishlist } from "@/lib/wishlist/store";

/**
 * Renders the user's wishlist. Reads the saved handles from `useWishlist` (localStorage)
 * and fetches only those products via a server action — no more 50-product over-fetch.
 *
 * Three states:
 *  - `products === null` → first render, server action in flight → skeleton grid
 *  - `products.length === 0` → empty wishlist → friendly empty state
 *  - otherwise → ProductGrid
 *
 * Re-fetches whenever the handles array changes (add/remove from another tab/page).
 */
export function WishlistList() {
  const t = useTranslations("wishlist");
  const locale = useLocale() as Locale;
  const { handles } = useWishlist();
  const [products, setProducts] = useState<Product[] | null>(null);

  useEffect(() => {
    if (handles.length === 0) {
      setProducts([]);
      return;
    }
    let cancelled = false;
    setProducts(null);
    getWishlistProductsAction(handles, locale).then((res) => {
      if (!cancelled) setProducts(res);
    });
    return () => {
      cancelled = true;
    };
  }, [handles, locale]);

  if (products === null) {
    return (
      <div className="grid grid-cols-2 gap-x-2 gap-y-4 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="aspect-[4/5] animate-pulse bg-black/5" />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 py-12 text-center">
        <p className="font-display text-2xl">{t("empty")}</p>
        <p className="max-w-sm text-sm opacity-70">{t("emptyDesc")}</p>
        <Link href="/shop" className="btn-ghost mt-2">
          {t("browseShop")}
        </Link>
      </div>
    );
  }

  return <ProductGrid products={products} priorityFirst={4} />;
}
