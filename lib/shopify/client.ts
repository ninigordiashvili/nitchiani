import { cache } from "react";
import type { Cart, Collection, Product } from "./types";
import {
  DUMMY_RAW_COLLECTIONS,
  DUMMY_RAW_PRODUCTS,
  localizeCollection,
  localizeProduct,
} from "./dummy";
import { findMatchingProducts } from "./search";
import { adaptProduct } from "../echodesk/adapt";
import { getProductBySlug, isEchoDeskConfigured, listProducts } from "../echodesk/client";
import { categoriesFor } from "../echodesk/categories";
import type { Locale } from "../i18n/config";
import { defaultLocale } from "../i18n/config";

const SHOPIFY_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN;
const SHOPIFY_TOKEN = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;
const API_VERSION = process.env.SHOPIFY_API_VERSION ?? "2025-01";

export const isShopifyConfigured = Boolean(SHOPIFY_DOMAIN && SHOPIFY_TOKEN);

type ShopifyFetchOptions = {
  query: string;
  variables?: Record<string, unknown>;
  cache?: RequestCache;
  tags?: string[];
};

export async function shopifyFetch<T>({
  query,
  variables,
  cache = "force-cache",
  tags,
}: ShopifyFetchOptions): Promise<T> {
  if (!isShopifyConfigured) {
    throw new Error("Shopify is not configured. Set SHOPIFY_STORE_DOMAIN and SHOPIFY_STOREFRONT_ACCESS_TOKEN.");
  }

  const res = await fetch(
    `https://${SHOPIFY_DOMAIN}/api/${API_VERSION}/graphql.json`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": SHOPIFY_TOKEN!,
      },
      body: JSON.stringify({ query, variables }),
      cache,
      next: tags ? { tags } : undefined,
    },
  );

  const json = (await res.json()) as { data: T; errors?: unknown };
  if (json.errors) throw new Error(JSON.stringify(json.errors));
  return json.data;
}

// ---------- Public API ----------
//
// Products come from EchoDesk once NEXT_PUBLIC_ECHODESK_API_URL is set, and from the bundled
// sample catalog otherwise. Both paths return the same `Product` shape (see
// `lib/echodesk/adapt.ts`), so callers never learn which backend answered.
//
// The fallback is not only for local dev: it also covers the tenant being reachable but
// empty, which is the state during catalog migration. A storefront with nothing in it is
// worse than one showing samples, so an empty result falls back rather than rendering bare.
//
// Collections still come from the sample data — the tenant exposes merchandising through
// item-lists/attributes rather than a categories endpoint, so that mapping is separate work.

/**
 * The live catalog, adapted and memoised per request+locale.
 *
 * Several getters need the whole list (collections, search, related products) and React's
 * `cache` collapses those into one upstream call per render rather than one per caller.
 * Returns `[]` when EchoDesk is unconfigured, unreachable or empty — every caller treats
 * that as "fall back to samples".
 */
const catalog = cache(async (locale: Locale): Promise<Product[]> => {
  if (!isEchoDeskConfigured) return [];
  const page = await listProducts(200);
  return (page?.results ?? []).map((p) => adaptProduct(p, locale));
});

export async function getProducts(locale: Locale = defaultLocale, limit = 20): Promise<Product[]> {
  const live = await catalog(locale);
  if (live.length > 0) return live.slice(0, limit);
  return DUMMY_RAW_PRODUCTS.slice(0, limit).map((p) => localizeProduct(p, locale));
}

/**
 * Is the live catalog actually serving?
 *
 * The fallback to samples has to be all-or-nothing. Deciding per-lookup means a handle that
 * exists in the samples but not in EchoDesk — every hardcoded pick in `lib/bundles.ts`,
 * `lib/campaigns.ts` and the homepage — quietly resurrects a sample product next to the real
 * ones. The shopper then sees items that cannot be bought, priced in a catalog that no longer
 * exists. So once EchoDesk answers with anything, it is the only source.
 */
async function isLive(locale: Locale): Promise<boolean> {
  return (await catalog(locale)).length > 0;
}

export async function getProductByHandle(
  handle: string,
  locale: Locale = defaultLocale,
): Promise<Product | null> {
  if (await isLive(locale)) {
    const live = await getProductBySlug(handle);
    return live ? adaptProduct(live, locale) : null;
  }
  const raw = DUMMY_RAW_PRODUCTS.find((p) => p.handle === handle);
  return raw ? localizeProduct(raw, locale) : null;
}

/**
 * Batch-fetch products by handle. Returns only matched products, preserving the input
 * order — so a caller passing wishlist handles in add-order gets them back in add-order.
 * Empty input → empty output (no Shopify call when wired to the real backend).
 */
export async function getProductsByHandles(
  handles: string[],
  locale: Locale = defaultLocale,
): Promise<Product[]> {
  if (handles.length === 0) return [];
  const handleSet = new Set(handles);
  const source = await catalog(locale);
  const byHandle = new Map(source.filter((p) => handleSet.has(p.handle)).map((p) => [p.handle, p]));
  return handles.map((h) => byHandle.get(h)).filter((p): p is Product => p !== undefined);
}

/**
 * Collections when the catalog is live.
 *
 * The tenant has no merchandising of its own yet — `item-lists` and `homepage.sections` are
 * both empty — so rather than inventing titles we keep the brand's own collection copy
 * (names, descriptions, imagery) as the shells and fill their contents from EchoDesk.
 *
 * Membership can only use what the API actually gives us: `is_featured` for best sellers, and
 * API order for new arrivals. The themed categories (bonnets, loc care, …) have nothing to
 * match on until products carry category attributes, so they come back empty and the existing
 * empty state handles them. That is the honest rendering of a catalog with one product in it.
 */
function liveCollections(products: Product[], locale: Locale): Collection[] {
  return DUMMY_RAW_COLLECTIONS.map((raw) => {
    const shell = localizeCollection(raw, locale);
    let members: Product[] = [];
    if (raw.handle === "all-products") members = products;
    else if (raw.handle === "new-arrivals") members = products;
    // Themed categories come from the manual map — the API has nothing to match on.
    else members = products.filter((p) => categoriesFor(p.handle).includes(raw.handle));
    return { ...shell, products: members };
  });
}

export async function getCollections(locale: Locale = defaultLocale): Promise<Collection[]> {
  const products = await catalog(locale);
  if (products.length > 0) return liveCollections(products, locale);
  return DUMMY_RAW_COLLECTIONS.map((c) => localizeCollection(c, locale));
}

export async function getCollectionByHandle(
  handle: string,
  locale: Locale = defaultLocale,
): Promise<Collection | null> {
  const products = await catalog(locale);
  if (products.length > 0) {
    return liveCollections(products, locale).find((c) => c.handle === handle) ?? null;
  }
  const raw = DUMMY_RAW_COLLECTIONS.find((c) => c.handle === handle);
  return raw ? localizeCollection(raw, locale) : null;
}

export async function getNewArrivals(locale: Locale = defaultLocale, limit = 8): Promise<Product[]> {
  const collection = await getCollectionByHandle("new-arrivals", locale);
  return collection?.products.slice(0, limit) ?? [];
}

export async function searchProducts(
  query: string,
  locale: Locale = defaultLocale,
  limit = 8,
): Promise<Product[]> {
  {
    const products = await catalog(locale);
    if (products.length > 0) {
      // `findMatchingProducts` scores the raw sample shape, so live products get a simple
      // substring match over the fields a shopper actually types: title, type, description.
      const q = query.trim().toLowerCase();
      if (!q) return [];
      return products
        .filter((p) =>
          [p.title, p.productType, p.description].some((f) => f?.toLowerCase().includes(q)),
        )
        .slice(0, limit);
    }
  }
  return findMatchingProducts(DUMMY_RAW_PRODUCTS, query, locale, limit);
}

export async function getRelatedProducts(
  product: Product,
  locale: Locale = defaultLocale,
  limit = 4,
): Promise<Product[]> {
  const all = await getProducts(locale, 50);
  return all
    .filter((p) => p.handle !== product.handle && p.productType === product.productType)
    .slice(0, limit);
}

// Cart — Phase 1 stub. Phase 2 wires Shopify Cart API for real.
export const EMPTY_CART: Cart = {
  id: "empty",
  checkoutUrl: "/checkout",
  totalQuantity: 0,
  lines: [],
  cost: {
    subtotalAmount: { amount: "0.00", currencyCode: "GEL" },
    totalAmount: { amount: "0.00", currencyCode: "GEL" },
  },
};
