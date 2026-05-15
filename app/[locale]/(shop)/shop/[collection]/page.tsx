import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { Suspense } from "react";
import { CampaignView } from "@/components/commerce/CampaignView";
import { FilteredCollection } from "@/components/commerce/FilteredCollection";
import { CategoryChips } from "@/components/homepage/CategoryChips";
import { getCampaignBySlug } from "@/lib/campaigns";
import { getCollectionByHandle, getProductsByHandles } from "@/lib/shopify/client";
import type { Locale } from "@/lib/i18n/config";

/**
 * Catch-all for `/shop/<slug>`. Branches on the slug:
 *   1. Campaign? → render the curated landing page (hero + tagline + grid).
 *   2. Otherwise → standard collection page (chips + filter toolbar + grid).
 *   3. Neither → 404.
 *
 * Campaign slugs are kept distinct from collection handles by convention (see
 * `lib/campaigns.ts`) — collisions would silently shadow a collection.
 */
export default async function CollectionPage({
  params,
}: {
  params: Promise<{ locale: Locale; collection: string }>;
}) {
  const { locale, collection: handle } = await params;
  setRequestLocale(locale);

  const campaign = getCampaignBySlug(handle);
  if (campaign) {
    const products = await getProductsByHandles(campaign.handles, locale);
    if (products.length === 0) notFound();
    return <CampaignView campaign={campaign} products={products} locale={locale} />;
  }

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
