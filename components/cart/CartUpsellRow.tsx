"use client";

import { Plus } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { getRecommendedProductsAction } from "@/app/actions/recommendations";
import { PriceDisplay } from "@/components/commerce/PriceDisplay";
import { Link } from "@/lib/i18n/routing";
import { useCart } from "@/lib/cart/store";
import type { Locale } from "@/lib/i18n/config";
import { BLUR_DATA_URL, safeImageSrc } from "@/lib/images";
import type { Product } from "@/lib/shopify/types";
import { cn } from "@/lib/utils";

/**
 * "You might also like" rail shown when the cart has items.
 *
 * - `variant="drawer"` → compact horizontal scroller used inside the cart drawer.
 *   Cards are ~120px wide; user swipes through them.
 * - `variant="page"`   → responsive grid (2 → 4 cols) used on the standalone `/cart` page.
 *
 * Source is `getRecommendedProductsAction` (same as EmptyCartRecommendations). We fetch 8, filter out
 * anything already in the cart, and render up to 4. If nothing remains, the row is hidden.
 *
 * The whole card links to the PDP; the floating `+` button adds the first available variant
 * directly, with a brief flash so the user knows it landed.
 */
export function CartUpsellRow({ variant }: { variant: "drawer" | "page" }) {
  const t = useTranslations("cart");
  const locale = useLocale() as Locale;
  const cart = useCart();
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    let cancelled = false;
    getRecommendedProductsAction(locale, 8).then((result) => {
      if (!cancelled) setProducts(result);
    });
    return () => {
      cancelled = true;
    };
  }, [locale]);

  const cartHandles = new Set(cart.lines.map((l) => l.productHandle));
  const candidates = products.filter((p) => !cartHandles.has(p.handle)).slice(0, 4);

  if (candidates.length === 0) return null;

  const isDrawer = variant === "drawer";

  // Drawer column count is content-driven: pick a grid that fills the drawer width
  // exactly so cards never leave dead space on either edge. Four cards go 2×2 (more
  // editorial than 4×1 in a 448px container); three sit in one row; two split the row;
  // one fills the row alone.
  const drawerColsClass = (() => {
    switch (candidates.length) {
      case 1:
        return "grid-cols-1";
      case 2:
        return "grid-cols-2";
      case 3:
        return "grid-cols-3";
      default:
        return "grid-cols-2";
    }
  })();

  return (
    <div className={cn(isDrawer ? "mx-4 border-t border-black/10 py-4" : "mt-12")}>
      <p className="label-eyebrow mb-3">{t("upsellHeader")}</p>
      <ul
        className={cn(
          "grid gap-3",
          isDrawer
            ? drawerColsClass
            : "grid-cols-2 gap-x-3 gap-y-5 sm:grid-cols-4",
        )}
      >
        {candidates.map((p) => (
          <UpsellCard key={p.id} product={p} compact={isDrawer} />
        ))}
      </ul>
    </div>
  );
}

function UpsellCard({ product, compact }: { product: Product; compact: boolean }) {
  const t = useTranslations("product");
  const cart = useCart();
  const variant = product.variants.find((v) => v.availableForSale) ?? product.variants[0];
  const [justAdded, setJustAdded] = useState(false);

  const onAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!variant?.availableForSale) return;
    cart.addLine({
      variantId: variant.id,
      productHandle: product.handle,
      productTitle: product.title,
      variantTitle: variant.title,
      image: product.featuredImage,
      unitPrice: variant.price,
      maxQuantity: variant.quantityAvailable,
    });
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1200);
  };

  return (
    <li>
      <Link href={`/products/${product.handle}`} className="group block">
        <div className="relative aspect-square overflow-hidden bg-white">
          <Image
            src={safeImageSrc(product.featuredImage.url)}
            alt={product.featuredImage.altText}
            fill
            sizes={compact ? "200px" : "(min-width: 640px) 25vw, 50vw"}
            placeholder="blur"
            blurDataURL={BLUR_DATA_URL}
            className="object-contain transition-transform duration-500 ease-[var(--ease-brand)] group-hover:scale-105"
          />
          <button
            type="button"
            onClick={onAdd}
            aria-label={t("addToCart")}
            disabled={!variant?.availableForSale}
            className={cn(
              "absolute right-1.5 bottom-1.5 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full transition-all",
              !variant?.availableForSale && "cursor-not-allowed opacity-40",
            )}
            style={{
              background: justAdded
                ? "var(--color-brand-maroon)"
                : "var(--color-brand-ink)",
              color: "var(--color-brand-cream)",
              transform: justAdded ? "scale(1.1)" : "scale(1)",
            }}
          >
            <Plus
              size={14}
              style={{
                transform: justAdded ? "rotate(45deg)" : "rotate(0deg)",
                transition: "transform 0.2s var(--ease-brand)",
              }}
            />
          </button>
        </div>
        <p className="mt-2 line-clamp-2 text-xs leading-tight">{product.title}</p>
        <div className="mt-1">
          <PriceDisplay
            price={variant?.price ?? product.priceRange.min}
            compareAt={variant?.compareAtPrice}
            size="sm"
          />
        </div>
      </Link>
    </li>
  );
}
