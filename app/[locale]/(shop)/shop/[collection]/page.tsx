import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { Suspense } from "react";
import { FilteredCollection } from "@/components/commerce/FilteredCollection";
import { CategoryChips } from "@/components/homepage/CategoryChips";
import { getCollectionByHandle } from "@/lib/shopify/client";
import type { Locale } from "@/lib/i18n/config";

export default async function CollectionPage({
  params,
}: {
  params: Promise<{ locale: Locale; collection: string }>;
}) {
  const { locale, collection: handle } = await params;
  setRequestLocale(locale);

  const collection = await getCollectionByHandle(handle, locale);
  if (!collection) notFound();

  return (
    <div className="pb-12">
      <CategoryChips />
      <section className="container-shop mt-4">
        <header className="mb-6">
          <h1 className="font-display text-3xl tracking-tight sm:text-4xl">
            {collection.title}
          </h1>
          <p className="mt-2 max-w-prose text-sm opacity-70">{collection.description}</p>
        </header>

        <Suspense>
          <FilteredCollection products={collection.products} />
        </Suspense>
      </section>
    </div>
  );
}
