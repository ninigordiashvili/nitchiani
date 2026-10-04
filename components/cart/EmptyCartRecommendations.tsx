"use client";

import { ShoppingBag } from "lucide-react";
import Image from "next/image";
import { useEffect, useState, useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { getRecommendedProductsAction } from "@/app/actions/recommendations";
import { PriceDisplay } from "@/components/commerce/PriceDisplay";
import { ProductCard } from "@/components/commerce/ProductCard";
import { CartUpsellRow } from "./CartUpsellRow";
import { Link } from "@/lib/i18n/routing";
import type { Locale } from "@/lib/i18n/config";
import { BLUR_DATA_URL, safeImageSrc } from "@/lib/images";
import {
  type RecentlyViewedItem,
  useRecentlyViewed,
} from "@/lib/recently-viewed/store";
import type { Product } from "@/lib/shopify/types";
import { cn } from "@/lib/utils";

/**
 * Empty-bag state. Two paths:
 *  - If the user has recently viewed products → render those snapshots ("Recently viewed").
 *    Personal, instant (no fetch), and a natural nudge to resume browsing.
 *  - Otherwise → fall back to a server-action fetch of best sellers ("Best sellers — what
 *    others are loving"), same as before.
 *
 * Used by the cart drawer (compact 2-col) and the cart page (wide 4-col).
 * `onCloseDrawer` is passed in from the drawer so clicks on product links close it too.
 */
export function EmptyCartRecommendations({
  variant,
  onCloseDrawer,
}: {
  variant: "drawer" | "page";
  onCloseDrawer?: () => void;
}) {
  const t = useTranslations();
  const locale = useLocale() as Locale;
  const { items: recentItems } = useRecentlyViewed();
  const [products, setProducts] = useState<Product[]>([]);
  const [isPending, startTransition] = useTransition();

  const useRecent = recentItems.length > 0;

  useEffect(() => {
    // Skip the recommendations fetch entirely when we have recently-viewed snapshots to show.
    if (useRecent) return;
    startTransition(async () => {
      const result = await getRecommendedProductsAction(locale, 4);
      setProducts(result);
    });
  }, [locale, useRecent]);

  const isDrawer = variant === "drawer";

  // In the drawer the empty state is the message, so it takes the middle of the panel; the
  // suggestions shrink to the compact row a full bag uses, along the bottom, instead of a
  // grid of large cards that pushed the message to the top and filled the screen.
  if (isDrawer) {
    return (
      <div className="flex min-h-full flex-col">
        <div className="flex flex-1 flex-col items-center justify-center px-6 py-10 text-center">
          <span
            className="mb-4 flex h-14 w-14 items-center justify-center rounded-full"
            style={{
              background: "color-mix(in oklab, var(--color-brand-maroon) 12%, transparent)",
              color: "var(--color-brand-maroon)",
            }}
            aria-hidden
          >
            <ShoppingBag size={24} />
          </span>
          <p className="font-display text-2xl">{t("cart.empty")}</p>
          <p className="mt-1 text-sm opacity-70">{t("cart.emptyDesc")}</p>
          <Link href="/shop" onClick={onCloseDrawer} className="btn-ghost mt-5 inline-flex">
            {t("cart.continueShopping")}
          </Link>
        </div>
        {/* Following a product link leaves the bag, so the drawer closes; the row's own
            buttons (scroll arrows, quick add) keep it open. */}
        <div
          onClick={(e) => {
            if ((e.target as Element).closest("a")) onCloseDrawer?.();
          }}
        >
          <CartUpsellRow variant="drawer" title={t("cart.recommendationsHeader")} />
        </div>
      </div>
    );
  }

  const gridCls = cn(
    "grid gap-x-2 gap-y-4",
    isDrawer ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-4",
  );

  return (
    <div className={cn("flex flex-col gap-6", isDrawer ? "px-4 py-6" : "py-12")}>
      <header className="text-center">
        <p className="font-display text-2xl">{t("cart.empty")}</p>
        <p className="mt-1 text-sm opacity-70">{t("cart.emptyDesc")}</p>
        <Link
          href="/"
          onClick={onCloseDrawer}
          className="btn-ghost mt-4 inline-flex"
        >
          {t("cart.continueShopping")}
        </Link>
      </header>

      <div>
        <p className="label-eyebrow mb-3 text-center">
          {useRecent ? t("home.recentlyViewed") : t("cart.recommendationsHeader")}
        </p>

        {useRecent ? (
          <div onClick={onCloseDrawer} className={gridCls}>
            {recentItems.slice(0, 4).map((item) => (
              <SnapshotCard key={item.handle} item={item} />
            ))}
          </div>
        ) : isPending && products.length === 0 ? (
          <div className={gridCls}>
            {Array.from({ length: 4 }, (_, i) => (
              <div key={i} className="aspect-[4/5] animate-pulse bg-black/5" />
            ))}
          </div>
        ) : (
          <div onClick={onCloseDrawer} className={gridCls}>
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Lightweight card rendered from a `RecentlyViewedItem` snapshot — no variant/wishlist/badge
 * affordances since those need a full `Product`. The point here is recall, not re-evaluation:
 * "you were looking at this, want to come back?".
 */
function SnapshotCard({ item }: { item: RecentlyViewedItem }) {
  return (
    <Link href={`/products/${item.handle}`} className="group block">
      <div className="relative aspect-[4/5] overflow-hidden bg-white">
        <Image
          src={safeImageSrc(item.image.url)}
          alt={item.image.altText}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
          placeholder="blur"
          blurDataURL={BLUR_DATA_URL}
          className="object-contain transition-transform duration-[400ms] ease-[var(--ease-brand)] group-hover:scale-105"
        />
      </div>
      <p className="mt-2 line-clamp-1 text-sm font-medium leading-tight">{item.title}</p>
      <div className="mt-1">
        <PriceDisplay price={item.price} size="sm" />
      </div>
    </Link>
  );
}
