"use client";

import { useEffect, useState, useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { getBestSellersAction } from "@/app/actions/recommendations";
import { ProductCard } from "@/components/commerce/ProductCard";
import { Link } from "@/lib/i18n/routing";
import type { Locale } from "@/lib/i18n/config";
import type { Product } from "@/lib/shopify/types";
import { cn } from "@/lib/utils";

/**
 * Empty-bag state with best-seller recommendations. Used by the cart drawer (compact 2-col)
 * and the cart page (wide 4-col). On mount it fires a server action to fetch 4 best sellers.
 *
 * `onCloseDrawer` is optional — passed in from the cart drawer so clicking "continue shopping"
 * (or any product link) closes the drawer alongside navigating.
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
  const [products, setProducts] = useState<Product[]>([]);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    startTransition(async () => {
      const result = await getBestSellersAction(locale, 4);
      setProducts(result);
    });
  }, [locale]);

  const isDrawer = variant === "drawer";

  return (
    <div
      className={cn(
        "flex flex-col gap-6",
        isDrawer ? "px-4 py-6" : "py-12",
      )}
    >
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
          {t("cart.recommendationsHeader")}
        </p>
        {isPending && products.length === 0 ? (
          <div
            className={cn(
              "grid gap-x-2 gap-y-4",
              isDrawer
                ? "grid-cols-2"
                : "grid-cols-2 sm:grid-cols-4",
            )}
          >
            {Array.from({ length: 4 }, (_, i) => (
              <div
                key={i}
                className="aspect-[4/5] animate-pulse bg-black/5"
              />
            ))}
          </div>
        ) : (
          <div
            // Wrap so the click bubbles to close the drawer when navigating to a PDP.
            onClick={onCloseDrawer}
            className={cn(
              "grid gap-x-2 gap-y-4",
              isDrawer
                ? "grid-cols-2"
                : "grid-cols-2 sm:grid-cols-4",
            )}
          >
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
