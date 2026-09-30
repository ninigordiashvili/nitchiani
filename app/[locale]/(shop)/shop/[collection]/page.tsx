import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { Suspense } from "react";
import { CampaignView } from "@/components/commerce/CampaignView";
import { CollectionDescription } from "@/components/commerce/CollectionDescription";
import { FilteredCollection } from "@/components/commerce/FilteredCollection";
import { CategoryChips } from "@/components/homepage/CategoryChips";
import { getCampaignBySlug } from "@/lib/campaigns";
import { getCollectionByHandle, getProductsByHandles } from "@/lib/shopify/client";
import { localeAlternates, metaDescription, ogLocale } from "@/lib/seo";
import type { Locale } from "@/lib/i18n/config";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale; collection: string }>;
}): Promise<Metadata> {
  const { locale, collection: handle } = await params;
  const alternates = localeAlternates(locale, `/shop/${handle}`);

  // Same branch order as the page: campaign first, then collection.
  const campaign = getCampaignBySlug(handle);
  if (campaign) {
    return {
      title: locale === "ka" ? campaign.titleKa : campaign.titleEn,
      description: locale === "ka" ? campaign.taglineKa : campaign.taglineEn,
      alternates,
      openGraph: {
        ...ogLocale(locale),
        title: locale === "ka" ? campaign.titleKa : campaign.titleEn,
        description: locale === "ka" ? campaign.taglineKa : campaign.taglineEn,
        images: [{ url: campaign.bannerImage }],
      },
    };
  }

  const collection = await getCollectionByHandle(handle, locale);
  // Unreachable in practice — layout.tsx 404s unknown slugs first. See the product page.
  if (!collection) notFound();
  return {
    title: collection.seoTitle ?? collection.title,
    description: collection.seoDescription
      ? collection.seoDescription
      : collection.description
      ? metaDescription(collection.description)
      : `Shop ${collection.title} at Nitchiani — synthetic hair and care, shipped from Tbilisi.`,
    alternates,
    openGraph: {
      ...ogLocale(locale),
      ...(collection.image ? { images: [{ url: collection.image.url }] } : {}),
    },
  };
}

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
          <CollectionDescription text={collection.description} />
        </header>

        <Suspense>
          <FilteredCollection products={collection.products} />
        </Suspense>
      </section>
    </div>
  );
}
