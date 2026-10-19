"use client";

import Image from "next/image";
import { useMemo } from "react";
import { Link } from "@/lib/i18n/routing";
import type { Product } from "@/lib/shopify/types";
import { BLUR_DATA_URL, distinctImages, variantPhotos } from "@/lib/images";
import { discountPercent } from "@/lib/money";
import { NO_REVIEWS } from "@/lib/reviews";
import { useQuickView } from "@/lib/ui/quick-view";
import { PriceDisplay } from "./PriceDisplay";
import { CardAddButton } from "./CardAddButton";
import { CardPhotos } from "./CardPhotos";
import { LowStockBadge } from "./LowStockNotice";
import { lowStockCount, unitsLeft } from "@/lib/cart/stock";
import { useSoldOut } from "@/lib/cart/sold-out";
import { StarRating } from "./StarRating";
import { WishlistButton } from "./WishlistButton";

/**
 * Two cards per row on a phone, three on a tablet, four on a desktop grid — stated as the
 * width a card *actually* gets, not the fraction of the window its column occupies.
 *
 * The gutters are the whole point. A phone card is not 50vw: the grid sits inside
 * `container-shop` (`px-4`) and the two columns are separated by `gap-x-2`, so each card is
 * `(100vw - 32px - 8px) / 2`. Claiming the larger figure made a DPR-2 phone around 410-430px
 * wide resolve 50vw to just over the 384w candidate and take the 640w one instead — 45 KB
 * of LCP image where 18 KB covers the slot. Same arithmetic per breakpoint: `sm` is `px-6`
 * with `gap-x-4` across three columns, `lg` is `px-8` with `gap-x-4` across four, and past
 * 1384px the container stops growing at its 1320px max-width so the card settles at 318px.
 *
 * The spaces inside `calc( … )` are load-bearing. next/image decides which candidate widths
 * to put in the srcset by scanning `sizes` with `/(^|\s)(1?\d?\d)vw/`, so a `vw` written
 * tight against the bracket is invisible to it and it falls back to emitting all sixteen
 * configured widths — including 16w-128w thumbnails no card will ever choose, which added
 * ~17 KB to the home page's HTML. With the spaces it emits the same ten widths as before.
 */
export const CARD_SIZES =
  "(min-width: 1384px) 318px, (min-width: 1024px) calc( 25vw - 28px ), (min-width: 640px) calc( 33.34vw - 26.7px ), calc( 50vw - 20px )";

export function ProductCard({
  product,
  priority = false,
  sizes = CARD_SIZES,
}: {
  product: Product;
  priority?: boolean;
  /** Overridden where a card is laid out somewhere narrower than the shop grid. */
  sizes?: string;
}) {
  const quickView = useQuickView();
  const variant = product.variants[0];
  const compareAt = variant?.compareAtPrice;
  const offPercent = discountPercent(variant?.price ?? product.priceRange.min, compareAt);
  const summary = product.reviewSummary ?? NO_REVIEWS;
  const knownSoldOut = useSoldOut();
  // Every shot worth showing, the product's own plus any a variant brings, with repeats of the
  // same file dropped — a placeholder gallery pads itself, and dots under one photo shown four
  // times read as a bug.
  const photos = useMemo(
    () => distinctImages([...product.images, ...variantPhotos(product)]),
    [product],
  );
  const lowStock = knownSoldOut(product.handle) ? null : lowStockCount(unitsLeft(product.variants));

  // Clicking the card (image, title, price) opens the quick view; the PDP is reached from
  // inside the sheet. The plus button is the other gesture and adds straight to the bag —
  // see `CardAddButton`. We keep the `<Link>` so cmd-/middle-click still opens the PDP in a
  // new tab, and crawlers continue to follow the href for SEO.
  const onCardClick = (e: React.MouseEvent) => {
    // Honour modifier-/middle-clicks → let the browser take the link.
    if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return;
    e.preventDefault();
    quickView.open(product);
  };

  return (
    <Link
      href={`/products/${product.handle}`}
      onClick={onCardClick}
      className="group block"
      aria-label={product.title}
    >
      {/* A warm hairline rather than a grey one — see `--border-card`. It deepens under the
          cursor, and the shadow only appears there too: a resting grid of sixteen shadows is
          heavier than the photography it frames. */}
      <div className="relative aspect-[4/5] overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border-card)] bg-white transition-[box-shadow,border-color] duration-300 ease-[var(--ease-brand)] group-hover:border-[var(--border-card-hover)] group-hover:shadow-[0_8px_28px_-10px_color-mix(in_oklab,var(--color-brand-maroon)_38%,transparent)]">
        {photos.length > 1 ? (
          // More than one shot: let them be browsed here, rather than only behind a tap.
          <CardPhotos
            images={photos}
            alt={product.featuredImage.altText}
            sizes={sizes}
            priority={priority}
          />
        ) : (
          <Image
            src={product.featuredImage.url}
            alt={product.featuredImage.altText}
            fill
            sizes={sizes}
            priority={priority}
            placeholder="blur"
            blurDataURL={BLUR_DATA_URL}
            className="object-contain transition-transform duration-[400ms] ease-[var(--ease-brand)] group-hover:scale-[1.025]"
          />
        )}
        {/* Top-left: the discount, then the stock warning beneath it when both apply. The
            column stops short of the wishlist heart in the opposite corner — the stock badge
            grew with its font size and ran underneath it. */}
        {offPercent !== null || lowStock !== null ? (
          <div className="absolute top-2.5 left-2.5 flex max-w-[calc(100%-3.25rem)] flex-col items-start gap-1">
            {offPercent !== null ? (
              <div className="flex items-center gap-1">
                <Badge tone="maroon">−{offPercent}%</Badge>
                {/* "SALE" is deliberately not translated — it reads as SALE on the Georgian
                    storefront too, the way the brand uses it. Hardcoded rather than pulled from
                    the message bundle so nobody "fixes" it into ფასდაკლება later. */}
                <Badge>SALE</Badge>
              </div>
            ) : null}
            {lowStock !== null ? <LowStockBadge count={lowStock} /> : null}
          </div>
        ) : null}
        <div className="absolute top-2.5 right-2.5">
          <WishlistButton handle={product.handle} />
        </div>
        <div className="absolute right-2.5 bottom-2.5">
          <CardAddButton product={product} />
        </div>
      </div>
      <div className="pt-3 pb-1">
        {/* Two lines: at this width every name in the catalogue overflows one, and a row of
            "ღრმა ტალღოვანი თმის…" tells a shopper nothing. */}
        <p className="line-clamp-2 text-sm font-medium leading-snug">{product.title}</p>
        {summary.count > 0 ? (
          <div className="mt-1 flex items-center gap-1 text-[11px] opacity-70">
            <StarRating
              value={summary.average}
              size={11}
              className="text-[var(--color-brand-maroon)]"
            />
            <span className="tabular-nums">({summary.count})</span>
          </div>
        ) : null}
        <div className="mt-1.5 flex items-center justify-between">
          <PriceDisplay
            price={variant?.price ?? product.priceRange.min}
            compareAt={compareAt}
          />
        </div>
      </div>
    </Link>
  );
}

function Badge({
  children,
  tone = "ink",
}: {
  children: React.ReactNode;
  tone?: "ink" | "maroon" | "cream";
}) {
  const styles =
    tone === "maroon"
      ? { background: "var(--color-brand-maroon)", color: "var(--color-brand-cream)" }
      : tone === "cream"
        ? { background: "var(--color-brand-cream)", color: "var(--color-brand-ink)" }
        : { background: "var(--color-brand-ink)", color: "var(--color-brand-cream)" };

  // Maroon = `-15%` style pill: tighter horizontal padding + no letter-tracking so the
  // background hugs the digits instead of looking like a wide promo bar.
  const isPercent = tone === "maroon";

  return (
    <span
      className={
        isPercent
          ? "px-1 py-0.5 text-[10px] font-medium"
          : "px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.14em]"
      }
      style={styles}
    >
      {children}
    </span>
  );
}
