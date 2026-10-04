"use client";

import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
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
 * - `variant="drawer"` → one row of small cards (~112px) that scrolls sideways, so the
 *   suggestions take a strip of the drawer rather than a full screen of it.
 * - `variant="page"`   → responsive grid (2 → 4 cols) used on the standalone `/cart` page.
 *
 * Source is `getRecommendedProductsAction` (same as EmptyCartRecommendations). We fetch 8, filter out
 * anything already in the cart, and render up to 4. If nothing remains, the row is hidden.
 *
 * The whole card links to the PDP; the floating `+` button adds the first available variant
 * directly, with a brief flash so the user knows it landed.
 */
export function CartUpsellRow({ variant, title }: { variant: "drawer" | "page"; title?: string }) {
  const t = useTranslations("cart");
  const locale = useLocale() as Locale;
  const cart = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const rowRef = useRef<HTMLUListElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  // Which arrows to show: only in a direction there's actually more to see.
  const updateArrows = useCallback(() => {
    const el = rowRef.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 4);
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

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
  const isDrawer = variant === "drawer";
  // The drawer row scrolls, so it can offer a couple more without taking more room.
  const candidates = products.filter((p) => !cartHandles.has(p.handle)).slice(0, isDrawer ? 6 : 4);

  // Re-measure when the cards arrive or the drawer is resized.
  useEffect(() => {
    if (!isDrawer) return;
    updateArrows();
    const el = rowRef.current;
    if (!el) return;
    const observer = new ResizeObserver(updateArrows);
    observer.observe(el);
    return () => observer.disconnect();
  }, [isDrawer, candidates.length, updateArrows]);

  if (candidates.length === 0) return null;

  const scrollByCards = (dir: 1 | -1) =>
    rowRef.current?.scrollBy({ left: dir * 2 * 124, behavior: "smooth" });

  // The drawer closes on a rightward swipe. Inside the row a sideways swipe means "show me
  // more", so it stays here instead of reaching the drawer and closing the bag.
  const keepSwipe = isDrawer
    ? {
        onTouchStart: (e: React.TouchEvent) => e.stopPropagation(),
        onTouchMove: (e: React.TouchEvent) => e.stopPropagation(),
        onTouchEnd: (e: React.TouchEvent) => e.stopPropagation(),
      }
    : {};

  return (
    <div className={cn(isDrawer ? "mx-4 border-t border-black/10 py-4" : "mt-12")}>
      <p className="mb-3 text-[13px] font-semibold">{title ?? t("upsellHeader")}</p>
      <div className="relative">
        <ul
          ref={rowRef}
          onScroll={isDrawer ? updateArrows : undefined}
          {...keepSwipe}
          className={cn(
            isDrawer
              ? "flex snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              : "grid grid-cols-2 gap-x-3 gap-y-5 sm:grid-cols-4",
          )}
        >
          {candidates.map((p) => (
            <UpsellCard key={p.id} product={p} compact={isDrawer} />
          ))}
        </ul>
        {/* Arrows for a mouse, which can't scroll sideways on its own; centred on the photos. */}
        {isDrawer && canPrev ? (
          <RowArrow side="left" label={t("upsellPrev")} onClick={() => scrollByCards(-1)} />
        ) : null}
        {isDrawer && canNext ? (
          <RowArrow side="right" label={t("upsellNext")} onClick={() => scrollByCards(1)} />
        ) : null}
      </div>
    </div>
  );
}

function RowArrow({ side, label, onClick }: { side: "left" | "right"; label: string; onClick: () => void }) {
  const Icon = side === "left" ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={cn(
        "absolute top-[56px] flex h-8 w-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-black/10 bg-white shadow-md transition-transform hover:scale-105",
        side === "left" ? "-left-2" : "-right-2",
      )}
    >
      <Icon size={16} strokeWidth={2.25} />
    </button>
  );
}

function UpsellCard({ product, compact }: { product: Product; compact: boolean }) {
  const t = useTranslations("product");
  const cart = useCart();
  const variant = product.variants.find((v) => v.availableForSale) ?? product.variants[0];
  const [justAdded, setJustAdded] = useState(false);
  // Every unit in stock is already in the bag: the + can't add more, so it doesn't offer to.
  const full = !!variant?.availableForSale && cart.canAdd(variant.id, variant.quantityAvailable) === 0;

  const onAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!variant?.availableForSale || full) return;
    const added = cart.addLine({
      variantId: variant.id,
      productHandle: product.handle,
      productTitle: product.title,
      variantTitle: variant.title,
      image: product.featuredImage,
      unitPrice: variant.price,
      maxQuantity: variant.quantityAvailable,
    });
    if (added === 0) return;
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1200);
  };

  return (
    <li className={cn(compact && "w-28 flex-shrink-0 snap-start")}>
      <Link href={`/products/${product.handle}`} className="group block">
        <div className="relative aspect-square overflow-hidden bg-white">
          <Image
            src={safeImageSrc(product.featuredImage.url)}
            alt={product.featuredImage.altText}
            fill
            sizes={compact ? "112px" : "(min-width: 640px) 25vw, 50vw"}
            placeholder="blur"
            blurDataURL={BLUR_DATA_URL}
            className="object-contain transition-transform duration-500 ease-[var(--ease-brand)] group-hover:scale-105"
          />
          <button
            type="button"
            onClick={onAdd}
            aria-label={t("addToCart")}
            disabled={!variant?.availableForSale || full}
            className={cn(
              "absolute right-1.5 bottom-1.5 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full transition-all",
              (!variant?.availableForSale || full) && "cursor-not-allowed opacity-40",
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
        <p className={cn("mt-2 line-clamp-2 leading-tight", compact ? "text-[11px]" : "text-xs")}>
          {product.title}
        </p>
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
