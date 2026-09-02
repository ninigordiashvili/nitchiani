import type { Product } from "../shopify/types";

export type SortKey = "featured" | "price-asc" | "price-desc";

export const SORT_KEYS: SortKey[] = ["featured", "price-asc", "price-desc"];
export const DEFAULT_SORT: SortKey = "featured";

export function isSortKey(v: string): v is SortKey {
  return (SORT_KEYS as string[]).includes(v);
}

export type ProductFilters = {
  /** Localized color name (matches whatever's currently displayed). Empty array = no color filter. */
  colors: string[];
  /** Show only items with a discounted (compareAt) price. */
  onSale: boolean;
  /** Hide products whose every variant is out of stock. */
  availableOnly: boolean;
  /** Maximum price in GEL (inclusive). `null` = no cap. Compared against `priceRange.min`. */
  maxPrice: number | null;
};

export const EMPTY_FILTERS: ProductFilters = {
  colors: [],
  onSale: false,
  availableOnly: false,
  maxPrice: null,
};

/** Preset price-tier chips shown in the toolbar. Edit here to add/remove tiers. */
export const PRICE_TIERS = [50] as const;

/**
 * Returns the unique color values present across the given products. Reads the option group
 * named "Color" / "ფერი" — language-agnostic match by checking whichever localized name appears.
 * Order is stable (first-seen across the list).
 */
export function extractColors(products: Product[]): string[] {
  const seen = new Set<string>();
  for (const p of products) {
    for (const opt of p.options) {
      if (opt.name === "Color" || opt.name === "ფერი") {
        for (const v of opt.values) {
          if (!seen.has(v)) seen.add(v);
        }
      }
    }
  }
  return Array.from(seen);
}

function productHasColor(p: Product, color: string): boolean {
  return p.options.some(
    (opt) =>
      (opt.name === "Color" || opt.name === "ფერი") && opt.values.includes(color),
  );
}

function productHasAvailableVariant(p: Product): boolean {
  return p.variants.some((v) => v.availableForSale);
}

function productOnSale(p: Product): boolean {
  return p.variants.some((v) => v.compareAtPrice !== undefined);
}

export function applyFilters(products: Product[], filters: ProductFilters): Product[] {
  return products.filter((p) => {
    if (filters.colors.length > 0 && !filters.colors.some((c) => productHasColor(p, c))) {
      return false;
    }
    if (filters.onSale && !productOnSale(p)) return false;
    if (filters.availableOnly && !productHasAvailableVariant(p)) return false;
    if (filters.maxPrice !== null && minPrice(p) > filters.maxPrice) return false;
    return true;
  });
}

function minPrice(p: Product): number {
  return Number.parseFloat(p.priceRange.min.amount);
}

export function applySort(products: Product[], sort: SortKey): Product[] {
  const arr = [...products];
  switch (sort) {
    case "price-asc":
      return arr.sort((a, b) => minPrice(a) - minPrice(b));
    case "price-desc":
      return arr.sort((a, b) => minPrice(b) - minPrice(a));
    case "featured":
    default:
      // isBestSeller first, then everything else
      return arr.sort((a, b) => Number(!!b.isBestSeller) - Number(!!a.isBestSeller));
  }
}
