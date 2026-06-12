import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Suspense } from "react";
import { FilteredCollection } from "@/components/commerce/FilteredCollection";
import { CategoryChips } from "@/components/homepage/CategoryChips";
import { getProducts } from "@/lib/shopify/client";
import { localeAlternates } from "@/lib/seo";
import type { Locale } from "@/lib/i18n/config";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "nav" });
  return {
    title: t("allProducts"),
    description: t("allProductsDesc"),
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
          <p className="mt-2 max-w-prose text-sm opacity-70">
            {t("allProductsDesc")}
          </p>
        </header>
        <Suspense>
          <FilteredCollection products={products} />
        </Suspense>
      </section>
    </div>
  );
}
