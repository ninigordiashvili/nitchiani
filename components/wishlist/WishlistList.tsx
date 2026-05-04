"use client";

import { useTranslations } from "next-intl";
import { useMemo } from "react";
import { Link } from "@/lib/i18n/routing";
import { useWishlist } from "@/lib/wishlist/store";
import { ProductGrid } from "@/components/commerce/ProductGrid";
import type { Product } from "@/lib/shopify/types";

/**
 * Renders the wishlist by filtering the full product set down to the user's saved handles.
 * Server-fetched products keep us SEO-friendly; client-side filter reads localStorage.
 */
export function WishlistList({ allProducts }: { allProducts: Product[] }) {
  const t = useTranslations("wishlist");
  const wishlist = useWishlist();

  const products = useMemo(() => {
    const handleSet = new Set(wishlist.handles);
    return allProducts.filter((p) => handleSet.has(p.handle));
  }, [allProducts, wishlist.handles]);

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
