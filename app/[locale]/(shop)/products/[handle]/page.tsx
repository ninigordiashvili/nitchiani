import { notFound } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { FrequentlyBoughtTogether } from "@/components/commerce/FrequentlyBoughtTogether";
import { PdpAssurance } from "@/components/commerce/PdpAssurance";
import { ProductAccordion } from "@/components/commerce/ProductAccordion";
import { ProductBreadcrumb } from "@/components/commerce/ProductBreadcrumb";
import { ProductGallery } from "@/components/commerce/ProductGallery";
import { ProductJsonLd } from "@/components/commerce/ProductJsonLd";
import { ShareButton } from "@/components/commerce/ShareButton";
import { ProductPurchase } from "@/components/commerce/ProductPurchase";
import { RecentlyViewedRail } from "@/components/commerce/RecentlyViewedRail";
import { RelatedProducts } from "@/components/commerce/RelatedProducts";
import { Reviews } from "@/components/commerce/Reviews";
import { StarRating } from "@/components/commerce/StarRating";
import { TrackRecentlyViewed } from "@/components/commerce/TrackRecentlyViewed";
import { getProductByHandle, getRelatedProducts } from "@/lib/shopify/client";
import { getReviewSummary } from "@/lib/reviews";
import type { Locale } from "@/lib/i18n/config";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ locale: Locale; handle: string }>;
}) {
  const { locale, handle } = await params;
  setRequestLocale(locale);

  const product = await getProductByHandle(handle, locale);
  if (!product) notFound();

  const [related, t, tProduct] = await Promise.all([
    getRelatedProducts(product, locale, 4),
    getTranslations("reviews"),
    getTranslations("product"),
  ]);
  const summary = getReviewSummary(handle);

  return (
    <article className="pb-12">
      <ProductJsonLd product={product} locale={locale} />
      <div className="container-shop pt-4 sm:grid sm:grid-cols-2 sm:gap-10 sm:pt-8">
        <ProductGallery images={product.images} title={product.title} />

        <div className="mt-6 sm:mt-0">
          <ProductBreadcrumb product={product} locale={locale} />
          <h1 className="font-display text-3xl leading-tight tracking-tight sm:text-4xl">
            {product.title}
          </h1>

          <div className="mt-2 flex items-center justify-between gap-3">
            {summary.count > 0 ? (
              <a
                href="#reviews"
                className="inline-flex items-center gap-2 text-xs opacity-80 hover:opacity-100"
              >
                <StarRating
                  value={summary.average}
                  size={13}
                  className="text-[var(--color-brand-maroon)]"
                />
                <span>
                  {summary.average.toFixed(1)} · {t("count", { count: summary.count })}
                </span>
              </a>
            ) : (
              <span />
            )}
            <ShareButton
              title={product.title}
              url={`/${locale}/products/${product.handle}`}
            />
          </div>

          <div className="mt-5">
            <ProductPurchase product={product} />
          </div>

          <div className="mt-8 border-t border-black/10 pt-6">
            {/* Description stays plain — it's the primary product copy, shouldn't require a tap. */}
            <p className="label-eyebrow mb-2">{tProduct("description")}</p>
            <p className="max-w-prose text-sm leading-relaxed opacity-85">
              {product.description}
            </p>

            {/* Secondary details collapse to keep the PDP scannable. */}
            {product.howToUse || product.whatsInside ? (
              <div className="mt-6 border-t border-black/10">
                {product.howToUse ? (
                  <ProductAccordion title={tProduct("howToUse")}>
                    <p className="max-w-prose text-sm leading-relaxed opacity-85">
                      {product.howToUse}
                    </p>
                  </ProductAccordion>
                ) : null}
                {product.whatsInside ? (
                  <ProductAccordion title={tProduct("whatsInside")}>
                    <p className="max-w-prose text-sm leading-relaxed opacity-85">
                      {product.whatsInside}
                    </p>
                  </ProductAccordion>
                ) : null}
              </div>
            ) : null}
          </div>

          <PdpAssurance productTitle={product.title} />
        </div>
      </div>

      <FrequentlyBoughtTogether product={product} related={related} />

      <Reviews handle={handle} />
      <RelatedProducts products={related} />

      <div className="container-shop mt-12">
        <RecentlyViewedRail excludeHandle={handle} />
      </div>

      <TrackRecentlyViewed product={product} />
    </article>
  );
}
