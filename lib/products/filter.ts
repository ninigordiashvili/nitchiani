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

/** The tiers worth offering, if the products on screen actually straddle them. */
const PRICE_TIER_CANDIDATES = [25, 50, 100, 200];

/**
 * Price chips for the products on screen, rather than one hardcoded "under ₾50".
 *
 * A tier earns its chip only when it splits the set — something at or below it and something
 * above. A chip that selects everything filters nothing, and one that selects nothing drops
 * the shopper into the empty state. With a single ₾50 tier and five products above it, there
 * was no way to ask for the expensive half at all.
 */
export function priceTiers(products: Product[]): number[] {
  const prices = products.map((p) => Number.parseFloat(p.priceRange.min.amount));
  if (prices.length === 0) return [];
  return PRICE_TIER_CANDIDATES.filter(
    (tier) => prices.some((price) => price <= tier) && prices.some((price) => price > tier),
  );
}

/** True when at least one product carries a struck-through price. */
export function anyOnSale(products: Product[]): boolean {
  return products.some(productOnSale);
}

/** True when at least one product is sold out — the only case where "in stock" filters. */
export function anySoldOut(products: Product[]): boolean {
  return products.some((p) => !productHasAvailableVariant(p));
}

/**
 * Colour is the one thing this catalogue stores two ways. Some products carry it as a
 * product attribute (`color`, "ფერი"); others as a variant option group of the same name,
 * because EchoDesk lets a merchant do either and both are in use.
 *
 * Read separately they became two chip rows driving two different filters, so "შავი" showed
 * up twice — once under the `ფერი` label, once in the unlabelled row beside the price chips —
 * and each copy matched only its own half of the catalogue. Tapping the attribute one hid
 * every black product whose colour lives on its variants, and vice versa.
 *
 * So both shapes are read into one facet here, and `productHasColor` accepts either.
 */
const COLOR_ATTRIBUTE_KEYS = new Set(["color", "colour"]);
const COLOR_GROUP_NAMES = new Set(["Color", "Colour", "ფერი"]);

/** Colour travels in the URL as `?color=`, never as `?attr=color:`. */
export const COLOR_FACET_KEY = "color";

/** Matched by key first, by localized name second: the key is stable, the name is not. */
function isColorAttribute(attr: { key: string; name: string }): boolean {
  return COLOR_ATTRIBUTE_KEYS.has(attr.key.toLowerCase()) || COLOR_GROUP_NAMES.has(attr.name);
}

function isColorGroup(name: string): boolean {
  return COLOR_GROUP_NAMES.has(name);
}

/**
 * Every colour on offer across the given products, from both places one can live.
 *
 * Labelled with whatever the catalogue itself calls the group in the reader's language —
 * EchoDesk localizes the attribute and the option name alike, so this row needs no string
 * of its own and can't drift out of step with the chips beneath it.
 *
 * Null below two values, for the same reason the attribute facets drop out there: one colour
 * matches every product on screen, so the chip filters nothing and is only noise.
 */
export function extractColorFacet(products: Product[]): AttributeFacet | null {
  const values = new Set<string>();
  let name = "";
  for (const p of products) {
    for (const attr of p.attributes ?? []) {
      if (!isColorAttribute(attr)) continue;
      name ||= attr.name;
      for (const v of attr.values) values.add(v);
    }
    for (const opt of p.options) {
      if (!isColorGroup(opt.name)) continue;
      name ||= opt.name;
      for (const v of opt.values) values.add(v);
    }
  }
  if (values.size < 2) return null;
  return { key: COLOR_FACET_KEY, name, values: [...values].sort(compareFacetValues) };
}

function productHasColor(p: Product, color: string): boolean {
  return (
    p.options.some((opt) => isColorGroup(opt.name) && opt.values.includes(color)) ||
    (p.attributes ?? []).some((attr) => isColorAttribute(attr) && attr.values.includes(color))
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
const facetCollator = new Intl.Collator(undefined, { numeric: true, sensitivity: "base" });

/** Orders facet labels by their leading number when both have one, else alphabetically. */
export function compareFacetValues(a: string, b: string): number {
  const na = Number.parseFloat(a.replace(",", "."));
  const nb = Number.parseFloat(b.replace(",", "."));
  if (Number.isFinite(na) && Number.isFinite(nb) && na !== nb) return na - nb;
  return facetCollator.compare(a, b);
}

export function extractAttributeFacets(products: Product[]): AttributeFacet[] {
  const byKey = new Map<string, { name: string; values: Set<string> }>();

  for (const p of products) {
    for (const attr of p.attributes ?? []) {
      // Colour has a row of its own, fed from the variant options as well as from here.
      if (isColorAttribute(attr)) continue;
      const entry = byKey.get(attr.key) ?? { name: attr.name, values: new Set<string>() };
      for (const v of attr.values) entry.values.add(v);
      byKey.set(attr.key, entry);
    }
  }

  return [...byKey.entries()]
    .filter(([, v]) => v.values.size >= 2)
    // Smallest first, comparing the numbers inside the labels — "53.96 სმ" before "132 სმ",
    // "100 გრამი" before "600 გრამი" — instead of whatever order the products arrived in.
    .map(([key, v]) => ({ key, name: v.name, values: [...v.values].sort(compareFacetValues) }));
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
