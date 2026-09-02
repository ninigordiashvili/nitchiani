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

export async function getProducts(locale: Locale = defaultLocale, limit = 20): Promise<Product[]> {
  if (isEchoDeskConfigured) {
    const page = await listProducts(limit);
    const live = page?.results ?? [];
    if (live.length > 0) return live.slice(0, limit).map((p) => adaptProduct(p, locale));
  }
  return DUMMY_RAW_PRODUCTS.slice(0, limit).map((p) => localizeProduct(p, locale));
}

export async function getProductByHandle(
  handle: string,
  locale: Locale = defaultLocale,
): Promise<Product | null> {
  if (isEchoDeskConfigured) {
    const live = await getProductBySlug(handle);
    if (live) return adaptProduct(live, locale);
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
  const byHandle = new Map<string, Product>();
  for (const raw of DUMMY_RAW_PRODUCTS) {
    if (handleSet.has(raw.handle)) {
      byHandle.set(raw.handle, localizeProduct(raw, locale));
    }
  }
  return handles.map((h) => byHandle.get(h)).filter((p): p is Product => p !== undefined);
}

export async function getCollections(locale: Locale = defaultLocale): Promise<Collection[]> {
  return DUMMY_RAW_COLLECTIONS.map((c) => localizeCollection(c, locale));
}

export async function getCollectionByHandle(
  handle: string,
  locale: Locale = defaultLocale,
): Promise<Collection | null> {
  const raw = DUMMY_RAW_COLLECTIONS.find((c) => c.handle === handle);
  return raw ? localizeCollection(raw, locale) : null;
}

export async function getBestSellers(locale: Locale = defaultLocale, limit = 8): Promise<Product[]> {
  const collection = await getCollectionByHandle("best-sellers", locale);
  return collection?.products.slice(0, limit) ?? [];
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
