import { notFound } from "next/navigation";
import { getProductByHandle } from "@/lib/shopify/client";
import type { Locale } from "@/lib/i18n/config";

/**
 * Decides "does this product exist" before anything is sent, so an unknown handle is a real
 * 404 rather than a 404 screen served with a 200.
 *
 * It has to be a layout. The page sits under this route's loading.tsx, and a loading
 * boundary streams its skeleton — and with it the 200 — before the page body runs; a
 * `notFound()` there changes what the shopper sees but not what crawlers are told. A
 * segment's layout renders outside that segment's loading boundary, so a check here runs
 * first and the skeleton survives for products that do exist.
 *
 * The lookup is the same one the page makes, and it is de-duplicated within the request.
 */
export default async function ProductLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  // `string`, not `Locale`: Next types layout params loosely. app/[locale]/layout.tsx has
  // already 404'd anything that isn't a locale, so the narrowing below is safe.
  params: Promise<{ locale: string; handle: string }>;
}) {
  const { locale, handle } = await params;
  if (!(await getProductByHandle(handle, locale as Locale))) notFound();
  return children;
}
