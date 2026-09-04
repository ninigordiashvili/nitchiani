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
  /**
   * Backend-defined attribute filters, keyed by attribute key ("hair-type" → ["curly"]).
   * Generic so a new attribute in the CMS becomes a filter with no code change here.
   */
  attributes: Record<string, string[]>;
};

export const EMPTY_FILTERS: ProductFilters = {
  colors: [],
  onSale: false,
  availableOnly: false,
  maxPrice: null,
  attributes: {},
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

/** True when at least one variant can actually be bought. Exported: the cart's
 *  recommendation rails use the same definition of "in stock" as the shop's filter. */
export function productHasAvailableVariant(p: Product): boolean {
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
    if (!productMatchesAttributes(p, filters.attributes)) return false;
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

export type AttributeFacet = { key: string; name: string; values: string[] };

/**
 * The attribute filters worth showing for a given set of products.
 *
 * An attribute is only offered when at least two distinct values appear across the list.
 * With one value every product matches, so the chip filters nothing and just adds noise —
 * which is also what keeps a half-configured attribute from reaching the toolbar.
 */
export function extractAttributeFacets(products: Product[]): AttributeFacet[] {
  const byKey = new Map<string, { name: string; values: Set<string> }>();

  for (const p of products) {
    for (const attr of p.attributes ?? []) {
      const entry = byKey.get(attr.key) ?? { name: attr.name, values: new Set<string>() };
      for (const v of attr.values) entry.values.add(v);
      byKey.set(attr.key, entry);
    }
  }

  return [...byKey.entries()]
    .filter(([, v]) => v.values.size >= 2)
    .map(([key, v]) => ({ key, name: v.name, values: [...v.values] }));
}

function productMatchesAttributes(p: Product, selected: Record<string, string[]>): boolean {
  // Values within one attribute are OR'd (curly OR wavy); separate attributes are AND'd,
  // which is how shoppers read a filter list — narrowing with each group they touch.
  for (const [key, wanted] of Object.entries(selected)) {
    if (wanted.length === 0) continue;
    const owned = p.attributes?.find((a) => a.key === key)?.values ?? [];
    if (!wanted.some((w) => owned.includes(w))) return false;
  }
  return true;
}

/**
 * `?attr=hair-type:curly~wavy;length:22`
 *
 * `;` separates attributes, `:` splits key from values, `~` separates values — none of which
 * appear in a slug or a localized label, so nothing needs escaping and the URL stays readable
 * and shareable, which is the point of keeping filter state there at all.
 */
export function parseAttributeParam(raw: string | null): Record<string, string[]> {
  if (!raw) return {};
  const out: Record<string, string[]> = {};
  for (const group of raw.split(";")) {
    const [key, values] = group.split(":");
    if (!key || !values) continue;
    const list = values.split("~").map((v) => v.trim()).filter(Boolean);
    if (list.length > 0) out[key.trim()] = list;
  }
  return out;
}

/** Inverse of `parseAttributeParam`. Returns null when nothing is selected, so the caller
 *  can drop the query param entirely rather than leaving `?attr=` behind. */
export function serializeAttributeParam(
  attributes: Record<string, string[]>,
): string | null {
  const parts = Object.entries(attributes)
    .filter(([, v]) => v.length > 0)
    .map(([k, v]) => `${k}:${v.join("~")}`);
  return parts.length > 0 ? parts.join(";") : null;
}
