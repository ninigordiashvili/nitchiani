import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Suspense } from "react";
import { CollectionDescription } from "@/components/commerce/CollectionDescription";
import { FilteredCollection } from "@/components/commerce/FilteredCollection";
import { CategoryChips } from "@/components/homepage/CategoryChips";
import { getProducts } from "@/lib/shopify/client";
import { localeAlternates } from "@/lib/seo";
import type { Locale } from "@/lib/i18n/config";

/**
 * Served from cache and refreshed every 5 minutes, like the catalogue data it shows. The
 * filters read the URL in the browser (see lib/ui/use-url-query.ts), so the cached HTML still
 * carries the full product grid.
 */
export const revalidate = 300;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "nav" });
  return {
    // Its own title and description for search results: the on-page heading is too short to
    // say what the shop sells, and the on-page intro is longer than the ~155 characters Google
    // shows before cutting off.
    title: t("allProductsMetaTitle"),
    description: t("allProductsMetaDesc"),
    alternates: localeAlternates(locale, "/shop"),
  };
}

export default async function ShopPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [products, t] = await Promise.all([
    getProducts(locale, 50),
    getTranslations("nav"),
  ]);

  return (
    <div className="pb-12">
      <CategoryChips />
      <section className="container-shop mt-4">
        <header className="mb-6">
          <h1 className="font-display text-3xl tracking-tight sm:text-4xl">
            {t("allProducts")}
          </h1>
          {/* Same intro block as the category pages, so every listing reads alike. */}
          <CollectionDescription text={t("allProductsDesc")} />
        </header>
        <Suspense>
          <FilteredCollection products={products} />
        </Suspense>
      </section>
    </div>
  );
}
