import type { MetadataRoute } from "next";
import { CATEGORY_HANDLES } from "@/lib/categories";
import { CAMPAIGNS } from "@/lib/campaigns";
import { locales } from "@/lib/i18n/config";
import { getProducts, getProductsByHandles } from "@/lib/shopify/client";

/**
 * Sitemap for the full catalog. Emits one entry per public URL, with `alternates.languages`
 * pointing at every locale variant so Google can serve the right one per visitor.
 *
 * Excluded by design (user-specific, no SEO value):
 *  - /cart, /checkout/*, /wishlist
 *  - /auth/*, /api/*
 *
 * `localePrefix: "always"` (see `lib/i18n/routing.ts`) means every URL is locale-prefixed,
 * which is why each path is built with the locale segment baked in.
 */

const COLLECTIONS = [...CATEGORY_HANDLES];

const STATIC_PATHS = [
  "",
  "/shop",
  "/about",
  // "/contact",  // hidden — route lives in (content)/_contact
  "/order-status",
  "/terms",
  "/privacy",
  "/refund",
];

function getBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
    "http://localhost:3000"
  );
}

function buildEntry(
  baseUrl: string,
  path: string,
  priority = 0.7,
): MetadataRoute.Sitemap[number] {
  const languages: Record<string, string> = {};
  for (const l of locales) languages[l] = `${baseUrl}/${l}${path}`;
  return {
    // Use the first locale as the canonical URL; alternates carry the rest.
    url: `${baseUrl}/${locales[0]}${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority,
    alternates: { languages },
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getBaseUrl();
  // Locale only affects display copy; URLs are locale-prefixed manually below.
  const products = await getProducts(locales[0], 200);

  const entries: MetadataRoute.Sitemap = [];

  for (const path of STATIC_PATHS) {
    entries.push(buildEntry(baseUrl, path, path === "" ? 1 : 0.8));
  }
  for (const col of COLLECTIONS) {
    entries.push(buildEntry(baseUrl, `/shop/${col}`, 0.7));
  }
  // Only campaigns that resolve to real products. The campaign page calls `notFound()` when
  // its handles match nothing, so listing one here advertised a dead URL to Google — and
  // because the framework still answers those with 200, it reads as a soft 404 rather than an
  // honest one. `spring-drop-26` pointed at three demo handles that were never in the shop.
  for (const c of CAMPAIGNS) {
    const live = await getProductsByHandles(c.handles, locales[0]).catch(() => []);
    if (live.length === 0) continue;
    // Campaigns are usually time-bound and drive paid/social traffic — high priority while live.
    entries.push(buildEntry(baseUrl, `/shop/${c.slug}`, 0.8));
  }
  for (const p of products) {
    entries.push(buildEntry(baseUrl, `/products/${p.handle}`, 0.8));
  }

  return entries;
}
