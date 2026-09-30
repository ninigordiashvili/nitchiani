import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { FrequentlyBoughtTogether } from "@/components/commerce/FrequentlyBoughtTogether";
import { ProductInfoTabs } from "@/components/commerce/ProductInfoTabs";
import { ProductSpecList } from "@/components/commerce/ProductSpecList";
import { MaterialTrust } from "@/components/commerce/MaterialTrust";
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
import { localeAlternates, ogLocale, productSeo } from "@/lib/seo";
import { categoriesFor } from "@/lib/echodesk/categories";
import { CATEGORIES } from "@/lib/categories";
import type { Locale } from "@/lib/i18n/config";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale; handle: string }>;
}): Promise<Metadata> {
  const { locale, handle } = await params;
  const product = await getProductByHandle(handle, locale);
  // Unreachable in practice — layout.tsx has already 404'd an unknown handle — but it keeps
  // the lookup's null case honest if this ever renders without that layout.
  if (!product) notFound();

  // The category's name rounds out a short product name in search results.
  const categoryHandle = categoriesFor(handle)[0];
  const categoryKey = CATEGORIES.find((c) => c.handle === categoryHandle)?.labelKey;
  const tCategories = await getTranslations({ locale, namespace: "categories" });
  const { title, description } = productSeo({
    name: product.title,
    seoTitle: product.seoTitle,
    seoDescription: product.seoDescription,
    shortDescription: product.shortDescription,
    description: product.description,
    category: categoryKey ? tCategories(categoryKey as never) : undefined,
    locale,
  });
  const image = product.featuredImage?.url ?? product.images[0]?.url;

  return {
    title,
    description,
    alternates: localeAlternates(locale, `/products/${handle}`),
    openGraph: {
      ...ogLocale(locale),
      type: "website",
      title: product.title,
      description,
      ...(image ? { images: [{ url: image, alt: product.title }] } : {}),
    },
  };
}

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
  // Live catalog reports its own rating; the sample map only covers sample handles.
  const summary = product.reviewSummary ?? getReviewSummary(handle);

  return (
    <article className="pb-12">
      <ProductJsonLd product={product} locale={locale} />
      <div className="container-shop sm:grid sm:grid-cols-2 sm:gap-10">
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

          <ProductSpecList attributes={product.attributes} />

          <div className="mt-5">
            <ProductPurchase product={product} />
          </div>

          {/* Piercing-only — renders nothing for hair products since their `material` field
              is undefined. Sits between purchase and description so safety info reaches the
              buyer at the moment they're choosing variants. */}
          <MaterialTrust materialHandle={product.material} locale={locale} />

          {/* Description and the data sheet, as two tabs. Renders nothing when the product
              has neither, which is most of the catalogue until EchoDesk is filled in. */}
          <ProductInfoTabs description={product.description} attributes={product.attributes} />

          <div className="mt-8">
            {/* Secondary details collapse to keep the PDP scannable. */}
            {product.howToUse || product.whatsInside || product.aftercare ? (
              <div className="border-t border-black/10">
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
                {product.aftercare ? (
                  <ProductAccordion title={tProduct("aftercare")}>
                    <p className="max-w-prose text-sm leading-relaxed opacity-85">
                      {product.aftercare}
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

      <Reviews handle={handle} product={product} />
      <RelatedProducts products={related} />

      <div className="container-shop mt-12">
        <RecentlyViewedRail excludeHandle={handle} />
      </div>

      <TrackRecentlyViewed product={product} />
    </article>
  );
}
