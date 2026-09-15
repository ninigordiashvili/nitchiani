import { defaultLocale, locales, type Locale } from "@/lib/i18n/config";

/**
 * Absolute site origin, no trailing slash. Mirrors the fallback used by `robots.ts`,
 * `sitemap.ts` and `ProductJsonLd` — keep them in sync. In production
 * `NEXT_PUBLIC_SITE_URL` MUST be set, otherwise every canonical / OG URL resolves to
 * localhost.
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "http://localhost:3000";

/**
 * Builds Next.js `alternates` for a locale-prefixed page: a self-referencing canonical
 * plus an hreflang map covering every locale and `x-default`. This is the on-page
 * counterpart to the hreflang already emitted in `sitemap.ts` — Google wants both signals.
 *
 * `path` is the route WITHOUT the locale segment and without a trailing slash:
 *   ""                      → home
 *   "/shop"                 → shop index
 *   "/products/silk-bonnet" → a PDP
 *
 * Returned paths are root-relative; Next resolves them against `metadataBase` (set in the
 * root layout) into absolute URLs.
 */
export function localeAlternates(locale: Locale, path = "") {
  const clean = path === "/" ? "" : path;
  const languages: Record<string, string> = {};
  for (const l of locales) languages[l] = `/${l}${clean}`;
  // x-default points at the default locale so Google has a fallback for unmatched regions.
  languages["x-default"] = `/${defaultLocale}${clean}`;
  return { canonical: `/${locale}${clean}`, languages };
}

/** OpenGraph `og:locale` + `og:locale:alternate` for the active locale. */
const OG_LOCALES: Record<Locale, string> = { ka: "ka_GE", en: "en_US" };

/**
 * `openGraph.locale` + `alternateLocale` fields for a page. Next picks the *deepest*
 * `openGraph` it finds (it does not deep-merge across segments), so any page that defines
 * its own `openGraph` must spread this in — otherwise the locale set on the layout is lost.
 */
export function ogLocale(locale: Locale) {
  return {
    locale: OG_LOCALES[locale],
    alternateLocale: locales.filter((l) => l !== locale).map((l) => OG_LOCALES[l]),
  };
}

/**
 * A long-form description trimmed to what a search result actually shows.
 *
 * Category and product copy is written for the page — several sentences, because that is what
 * gives a thin listing page something to rank on. Google renders roughly 160 characters of a
 * meta description and cuts the rest, so handing it the whole paragraph wastes the slot and
 * ends it mid-word.
 *
 * Whole sentences are kept while they fit; a first sentence longer than the budget is trimmed
 * at a word boundary instead, which still beats a clipped word.
 */
export function metaDescription(text: string, limit = 160): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= limit) return clean;

  const sentences = clean.match(/[^.!?]+[.!?]+(\s|$)/g) ?? [];
  let out = "";
  for (const s of sentences) {
    if ((out + s).trim().length > limit) break;
    out += s;
  }
  out = out.trim();

  // Whole sentences only win when they actually fill the space. Copy whose second sentence is
  // long leaves just the first — "Two Lorenti essentials for everyday care." at 41 of 160
  // characters — which reads as a stub and throws away two thirds of the snippet. Below this
  // mark a word-boundary trim of the full text says more, even ending in an ellipsis.
  if (out.length >= limit * 0.6) return out;

  const cut = clean.slice(0, limit);
  return cut.slice(0, cut.lastIndexOf(" ")).trim() + "…";
}
