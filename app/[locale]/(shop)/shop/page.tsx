import { setRequestLocale, getTranslations } from "next-intl/server";
import { Suspense } from "react";
import { FilteredCollection } from "@/components/commerce/FilteredCollection";
import { CategoryChips } from "@/components/homepage/CategoryChips";
import { getProducts } from "@/lib/shopify/client";
import type { Locale } from "@/lib/i18n/config";

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
        <h1 className="font-display mb-6 text-3xl tracking-tight sm:text-4xl">
          {t("shop")}
        </h1>
        <Suspense>
          <FilteredCollection products={products} />
        </Suspense>
      </section>
    </div>
  );
}
