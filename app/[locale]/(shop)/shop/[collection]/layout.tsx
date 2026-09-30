import { notFound } from "next/navigation";
import { getCampaignBySlug } from "@/lib/campaigns";
import { getCollectionByHandle, getProductsByHandles } from "@/lib/shopify/client";
import type { Locale } from "@/lib/i18n/config";

/**
 * Real 404s for unknown slugs — see the product route's layout for why this can't live in
 * the page, which is under loading.tsx.
 *
 * Mirrors the page's branches exactly: a campaign exists only if it has products to show,
 * otherwise the slug has to be a collection. An *empty* collection is not a 404 — it is a
 * real category with nothing in it yet, and the page says so.
 */
export default async function CollectionLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  // `string`, not `Locale`: Next types layout params loosely. app/[locale]/layout.tsx has
  // already 404'd anything that isn't a locale, so the narrowing below is safe.
  params: Promise<{ locale: string; collection: string }>;
}) {
  const { locale, collection: handle } = await params;
  const campaign = getCampaignBySlug(handle);
  const exists = campaign
    ? (await getProductsByHandles(campaign.handles, locale as Locale)).length > 0
    : (await getCollectionByHandle(handle, locale as Locale)) !== null;
  if (!exists) notFound();
  return children;
}
