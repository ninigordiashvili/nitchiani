import type { Cart, Collection, Product } from "./types";
import {
  DUMMY_RAW_COLLECTIONS,
  DUMMY_RAW_PRODUCTS,
  localizeCollection,
  localizeProduct,
} from "./dummy";
import { findMatchingProducts } from "./search";
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

// ---------- Public API (with dummy fallback for greenfield dev) ----------
//
// Each getter accepts a `locale` so dummy products/collections come back already
// translated. When real Shopify is wired, swap to a Storefront query that uses
// `@inContext(language: <KA|EN>)` so the same shape continues to work.

export async function getProducts(locale: Locale = defaultLocale, limit = 20): Promise<Product[]> {
  return DUMMY_RAW_PRODUCTS.slice(0, limit).map((p) => localizeProduct(p, locale));
}

export async function getProductByHandle(
  handle: string,
  locale: Locale = defaultLocale,
): Promise<Product | null> {
  const raw = DUMMY_RAW_PRODUCTS.find((p) => p.handle === handle);
  return raw ? localizeProduct(raw, locale) : null;
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
