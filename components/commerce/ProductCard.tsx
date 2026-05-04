import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/routing";
import type { Product } from "@/lib/shopify/types";
import { getReviewSummary } from "@/lib/reviews";
import { PriceDisplay } from "./PriceDisplay";
import { QuickViewButton } from "./QuickViewButton";
import { StarRating } from "./StarRating";
import { WishlistButton } from "./WishlistButton";

export function ProductCard({ product, priority = false }: { product: Product; priority?: boolean }) {
  const t = useTranslations("product");
  const variant = product.variants[0];
  const compareAt = variant?.compareAtPrice;
  const summary = getReviewSummary(product.handle);

  return (
    <Link
      href={`/products/${product.handle}`}
      className="group block"
      aria-label={product.title}
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-black/5">
        <Image
          src={product.featuredImage.url}
          alt={product.featuredImage.altText}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
          priority={priority}
          className="object-cover transition-transform duration-700 ease-[var(--ease-brand)] group-hover:scale-105"
        />
        {(product.isNew || product.isBestSeller || compareAt) && (
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {product.isBestSeller && <Badge>{t("badgeBestSeller")}</Badge>}
            {product.isNew && <Badge>{t("badgeNew")}</Badge>}
            {compareAt && <Badge tone="maroon">{t("badgeSale")}</Badge>}
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

  return (
    <span
      className="px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.14em]"
      style={styles}
    >
      {children}
    </span>
  );
}
