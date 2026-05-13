"use client";

import { Check } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useCart } from "@/lib/cart/store";
import { Link } from "@/lib/i18n/routing";
import type { Locale } from "@/lib/i18n/config";
import { BLUR_DATA_URL, safeImageSrc } from "@/lib/images";
import { formatPrice } from "@/lib/money";
import type { Product } from "@/lib/shopify/types";
import { cn } from "@/lib/utils";

/**
 * Classic Amazon-style "Frequently bought together" cross-sell. This product + up to 2 related
 * (all preselected); user can uncheck any to exclude. Tap "Add to bag" → loops the selected and
 * pushes each first-available variant into the cart.
 *
 * Source of "related" is the same data the PDP already passes to `RelatedProducts`. No new
 * fetching, no new data model — we just present them as a checkable bundle.
 *
 * Variant-aware caveat: uses `variants[0]` (or first available) for each product, including
 * the one currently being viewed. The user can still deselect "this item" in the bundle and
 * use the inline Add-to-bag block above for a specific picked variant.
 */
export function FrequentlyBoughtTogether({
  product,
  related,
}: {
  product: Product;
  related: Product[];
}) {
  const t = useTranslations("product");
  const locale = useLocale() as Locale;
  const cart = useCart();

  const items = [product, ...related.slice(0, 2)];
  // Need at least 2 products for the cross-sell to make sense — otherwise it's just the PDP again.
  const [selected, setSelected] = useState<Set<string>>(
    new Set(items.map((p) => p.handle)),
  );
  const [added, setAdded] = useState(false);

  if (items.length < 2) return null;

  const toggle = (handle: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(handle)) next.delete(handle);
      else next.add(handle);
      return next;
    });
  };

  const selectedItems = items.filter((p) => selected.has(p.handle));
  const total = selectedItems.reduce((sum, p) => {
    const v = p.variants[0];
    return sum + Number.parseFloat(v?.price.amount ?? "0");
  }, 0);
  const currencyCode = items[0]?.variants[0]?.price.currencyCode ?? "GEL";
  const canAdd = selectedItems.length > 0;

  const onAdd = () => {
    for (const p of selectedItems) {
      const v = p.variants.find((vv) => vv.availableForSale) ?? p.variants[0];
      if (!v) continue;
      cart.addLine({
        variantId: v.id,
        productHandle: p.handle,
        productTitle: p.title,
        variantTitle: v.title,
        image: p.featuredImage,
        unitPrice: v.price,
      });
    }
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <section className="container-shop mt-12">
      <p className="label-eyebrow mb-1.5">{t("frequentlyBoughtTogether")}</p>
      <h2 className="font-display mb-5 text-2xl tracking-tight sm:text-3xl">
        {t("fbtHeading")}
      </h2>

      <div className="rounded-lg border border-black/10 p-5 sm:p-6">
        <ul>
          {items.map((p, i) => {
            const isSelected = selected.has(p.handle);
            const variant = p.variants[0];
            const isThisItem = i === 0;
            return (
              <li
                key={p.handle}
                className={cn(
                  "flex items-center gap-3 py-3",
                  i > 0 && "border-t border-black/5",
                )}
              >
                <button
                  type="button"
                  onClick={() => toggle(p.handle)}
                  aria-pressed={isSelected}
                  aria-label={p.title}
                  className={cn(
                    "flex h-5 w-5 flex-shrink-0 cursor-pointer items-center justify-center rounded border transition-colors",
                    isSelected
                      ? "border-[var(--color-brand-ink)] bg-[var(--color-brand-ink)] text-[var(--color-brand-cream)]"
                      : "border-black/30 hover:border-black/60",
                  )}
                >
                  {isSelected ? <Check size={12} strokeWidth={2.5} /> : null}
                </button>

                <Link
                  href={`/products/${p.handle}`}
                  className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-md bg-black/5"
                >
                  <Image
                    src={safeImageSrc(p.featuredImage.url)}
                    alt={p.featuredImage.altText}
                    fill
                    sizes="56px"
                    placeholder="blur"
                    blurDataURL={BLUR_DATA_URL}
                    className="object-cover"
                  />
                </Link>

                <div className="min-w-0 flex-1">
                  <Link
                    href={`/products/${p.handle}`}
                    className="block hover:underline"
                  >
                    <p className="line-clamp-1 text-sm font-medium leading-tight">
                      {p.title}
                    </p>
                  </Link>
                  {isThisItem ? (
                    <span className="text-[11px] opacity-50">{t("fbtThisItem")}</span>
                  ) : null}
                </div>

                <span className="flex-shrink-0 text-sm tabular-nums">
                  {formatPrice(variant?.price ?? p.priceRange.min, locale)}
                </span>
              </li>
            );
          })}
        </ul>

        <div className="mt-5 flex flex-col gap-3 border-t border-black/10 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[11px] opacity-60">{t("fbtTotal")}</p>
            <p className="font-display text-2xl tabular-nums">
              {formatPrice({ amount: total.toFixed(2), currencyCode }, locale)}
            </p>
          </div>
          <button
            type="button"
            onClick={onAdd}
            disabled={!canAdd}
            className={cn(
              "btn-primary w-full sm:w-auto",
              !canAdd && "cursor-not-allowed opacity-50",
            )}
          >
            {added ? (
              <>
                <Check size={16} />
                {t("fbtAdded")}
              </>
            ) : (
              t("fbtAdd", { count: selectedItems.length })
            )}
          </button>
        </div>
      </div>
    </section>
  );
}
