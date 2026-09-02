"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/routing";
import type { Product } from "@/lib/shopify/types";
import { BLUR_DATA_URL } from "@/lib/images";
import { discountPercent } from "@/lib/money";
import { getReviewSummary } from "@/lib/reviews";
import { useQuickView } from "@/lib/ui/quick-view";
import { PriceDisplay } from "./PriceDisplay";
import { QuickViewButton } from "./QuickViewButton";
import { StarRating } from "./StarRating";
import { WishlistButton } from "./WishlistButton";

export function ProductCard({ product, priority = false }: { product: Product; priority?: boolean }) {
  const t = useTranslations("product");
  const quickView = useQuickView();
  const variant = product.variants[0];
  const compareAt = variant?.compareAtPrice;
  const offPercent = discountPercent(variant?.price ?? product.priceRange.min, compareAt);
  const summary = getReviewSummary(product.handle);

  // Funnel rule: clicking the card (image, title, price) opens the quick view first; the
  // PDP is reached from inside the modal. We keep the `<Link>` so cmd-/middle-click still
  // opens the PDP in a new tab, and crawlers continue to follow the href for SEO.
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
      <div className="relative aspect-[4/5] overflow-hidden bg-white">
        <Image
          src={product.featuredImage.url}
          alt={product.featuredImage.altText}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
          priority={priority}
          placeholder="blur"
          blurDataURL={BLUR_DATA_URL}
          className="object-contain transition-transform duration-[400ms] ease-[var(--ease-brand)] group-hover:scale-105"
        />
        {(product.isNew || offPercent !== null) && (
          <div className="absolute top-2 left-2 flex flex-col items-start gap-1">
            {offPercent !== null && (
              <span className="flex items-center gap-1">
                <Badge tone="maroon">−{offPercent}%</Badge>
                {/* "SALE" is deliberately not translated — it reads as SALE on the Georgian
                    storefront too, the way the brand uses it. Hardcoded rather than pulled
                    from the message bundle so nobody "fixes" it into ფასდაკლება later. */}
                <Badge>SALE</Badge>
              </span>
            )}
            {product.isNew && <Badge>{t("badgeNew")}</Badge>}
          </div>
        )}
        <div className="absolute top-2 right-2">
          <WishlistButton handle={product.handle} />
        </div>
        <div className="absolute right-2 bottom-2">
          <QuickViewButton product={product} />
        </div>
      </div>
      <div className="pt-3 pb-1">
        <p className="line-clamp-1 text-sm font-medium leading-tight">{product.title}</p>
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
