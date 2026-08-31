"use client";

import { Plus, Tag } from "lucide-react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/routing";
import type { Bundle } from "@/lib/bundles";
import { useCart } from "@/lib/cart/store";
import { discountFor, findCoupon } from "@/lib/cart/coupons";
import type { Locale } from "@/lib/i18n/config";
import { BLUR_DATA_URL, safeImageSrc } from "@/lib/images";
import { formatPrice } from "@/lib/money";
import type { Product } from "@/lib/shopify/types";

/**
 * Homepage curated-bundle CTA. Receives pre-fetched products as a prop (server component
 * does the Shopify lookup), so this client component is purely interaction: visual layout,
 * "Add all" handler, and a brief confirmation state.
 *
 * "Add all" iterates the bundle's products, pushes each first-available variant into the
 * cart, and applies the paired coupon — so the visible "save ₾X" is a real discount the
 * user sees again in totals at checkout.
 */
export function BundleUpsell({
  bundle,
  products,
}: {
  bundle: Bundle;
  products: Product[];
}) {
  const t = useTranslations("home");
  const locale = useLocale() as Locale;
  const cart = useCart();

  const title = locale === "ka" ? bundle.titleKa : bundle.titleEn;
  const tagline = locale === "ka" ? bundle.taglineKa : bundle.taglineEn;
  const currencyCode = products[0]?.variants[0]?.price.currencyCode ?? "GEL";

  const subtotalNum = products.reduce((sum, p) => {
    const v = p.variants[0];
    return sum + Number.parseFloat(v?.price.amount ?? "0");
  }, 0);
  const coupon = findCoupon(bundle.couponCode);
  const discountNum = coupon ? discountFor(subtotalNum, coupon) : 0;
  const bundleTotalNum = Math.max(0, subtotalNum - discountNum);

  const onAdd = () => {
    for (const p of products) {
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
    cart.applyCoupon(bundle.couponCode);
  };

  return (
    <div
      className="rounded-lg p-6 sm:p-8"
      style={{
        background:
          "color-mix(in oklab, var(--color-brand-maroon) 6%, var(--color-brand-cream))",
      }}
    >
      <div className="grid gap-6 sm:grid-cols-[1fr_auto] sm:items-center">
        <div>
          <p className="label-eyebrow mb-2">{t("bundleEyebrow")}</p>
          <h2 className="font-display text-3xl leading-tight tracking-tight sm:text-4xl">
            {title}
          </h2>
          <p className="mt-2 max-w-md text-sm opacity-70">{tagline}</p>

          <ul className="mt-5 flex items-center gap-2">
            {products.map((p, i) => (
              <li key={p.handle} className="flex items-center gap-2">
                <Link
                  href={`/products/${p.handle}`}
                  className="group relative block h-16 w-16 flex-shrink-0 overflow-hidden rounded-md bg-white"
                  aria-label={p.title}
                >
                  <Image
                    src={safeImageSrc(p.featuredImage.url)}
                    alt={p.featuredImage.altText}
                    fill
                    sizes="64px"
                    placeholder="blur"
                    blurDataURL={BLUR_DATA_URL}
                    className="object-contain transition-transform duration-500 ease-[var(--ease-brand)] group-hover:scale-105"
                  />
                </Link>
                {i < products.length - 1 ? (
                  <Plus size={14} className="flex-shrink-0 opacity-40" />
                ) : null}
              </li>
            ))}
          </ul>
        </div>

        <div className="border-t border-black/10 pt-6 sm:border-t-0 sm:border-l sm:pt-0 sm:pl-8">
          <div className="flex items-baseline gap-3">
            <span
              className="font-display text-3xl tabular-nums"
              style={{ color: "var(--color-brand-maroon)" }}
            >
              {formatPrice(
                { amount: bundleTotalNum.toFixed(2), currencyCode },
                locale,
              )}
            </span>
            {discountNum > 0 ? (
              <span className="text-sm tabular-nums line-through opacity-50">
                {formatPrice(
                  { amount: subtotalNum.toFixed(2), currencyCode },
                  locale,
                )}
              </span>
            ) : null}
          </div>
          {discountNum > 0 ? (
            <p
              className="mt-1 inline-flex items-center gap-1.5 text-xs"
              style={{ color: "var(--color-brand-maroon)" }}
            >
              <Tag size={12} />
              {t("bundleSave", {
                amount: formatPrice(
                  { amount: discountNum.toFixed(2), currencyCode },
                  locale,
                ),
              })}
            </p>
          ) : null}

          <button type="button" onClick={onAdd} className="btn-primary mt-4 w-full">
            {t("bundleAddAll")}
          </button>
        </div>
      </div>
    </div>
  );
}
