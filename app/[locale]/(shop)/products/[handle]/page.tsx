import { notFound } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { ProductGallery } from "@/components/commerce/ProductGallery";
import { ProductPurchase } from "@/components/commerce/ProductPurchase";
import { RelatedProducts } from "@/components/commerce/RelatedProducts";
import { Reviews } from "@/components/commerce/Reviews";
import { StarRating } from "@/components/commerce/StarRating";
import { TrustStrip } from "@/components/homepage/TrustStrip";
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
      <div className="container-shop pt-4 sm:grid sm:grid-cols-2 sm:gap-10 sm:pt-8">
        <ProductGallery images={product.images} title={product.title} />

        <div className="mt-6 sm:mt-0">
          <p className="label-eyebrow mb-2">{product.productType}</p>
          <h1 className="font-display text-3xl leading-tight tracking-tight sm:text-4xl">
            {product.title}
          </h1>

          {summary.count > 0 ? (
            <a
              href="#reviews"
              className="mt-2 inline-flex items-center gap-2 text-xs opacity-80 hover:opacity-100"
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
          ) : null}

          <div className="mt-5">
            <ProductPurchase product={product} />
          </div>

          <div className="mt-8 space-y-5 border-t border-black/10 pt-6">
            <Section title={tProduct("description")} body={product.description} />
            {product.howToUse ? (
              <Section title={tProduct("howToUse")} body={product.howToUse} />
            ) : null}
            {product.whatsInside ? (
              <Section title={tProduct("whatsInside")} body={product.whatsInside} />
            ) : null}
          </div>

          <div className="mt-6">
            <TrustStrip layout="column" />
          </div>
        </div>
      </div>

      <Reviews handle={handle} />
      <RelatedProducts products={related} />
    </article>
  );
}

function Section({ title, body }: { title: string; body: string }) {
  return (
    <div>
      <p className="label-eyebrow mb-2">{title}</p>
      <p className="max-w-prose text-sm leading-relaxed opacity-85">{body}</p>
    </div>
  );
}
