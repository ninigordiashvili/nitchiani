import type { Metadata } from "next";
import { connection } from "next/server";
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

  // Rendered per request, like /shop/[collection]. `FilteredCollection` reads the URL
  // (`?sort=`, `?color=`), and in a statically built page anything that does is skipped at
  // build time and drawn in the browser instead — so this page shipped as an empty <Suspense>,
  // with no products in the HTML Google indexes or a slow phone paints first. Per-request
  // rendering fills the grid on the server. The catalog fetch is still cached (see
  // lib/echodesk/client.ts), so this costs a render, not an EchoDesk call.
  await connection();

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
