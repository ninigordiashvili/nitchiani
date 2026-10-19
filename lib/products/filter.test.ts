import { describe, expect, it } from "vitest";
import {
  DEFAULT_SORT,
  SORT_KEYS,
  anyOnSale,
  EMPTY_FILTERS,
  anySoldOut,
  applyFilters,
  applySort,
  compareFacetValues,
  extractAttributeFacets,
  extractColorFacet,
  isSortKey,
  priceTiers,
} from "./filter";
import type { Product } from "../shopify/types";

const p = (handle: string, price: string): Product =>
  ({
    handle,
    priceRange: { min: { amount: price, currencyCode: "GEL" }, max: { amount: price, currencyCode: "GEL" } },
    variants: [{ price: { amount: price, currencyCode: "GEL" } }],
  }) as unknown as Product;

describe("sort options", () => {
  it("no longer offers 'new'", () => {
    expect(SORT_KEYS).toEqual(["featured", "price-asc", "price-desc"]);
    expect(isSortKey("new")).toBe(false);
  });

  it("falls back for an old ?sort=new bookmark instead of breaking", () => {
    // FilteredCollection does `isSortKey(raw) ? raw : DEFAULT_SORT`, so a stale link is safe.
    const raw = "new";
    expect(isSortKey(raw) ? raw : DEFAULT_SORT).toBe("featured");
  });

  it("still sorts by price in both directions", () => {
    const items = [p("b", "80.00"), p("a", "10.00"), p("c", "45.00")];
    expect(applySort(items, "price-asc").map((x) => x.handle)).toEqual(["a", "c", "b"]);
    expect(applySort(items, "price-desc").map((x) => x.handle)).toEqual(["b", "c", "a"]);
  });

  it("leaves the list intact for the default sort", () => {
    const items = [p("b", "80.00"), p("a", "10.00")];
    expect(applySort(items, "featured")).toHaveLength(2);
  });
});

describe("compareFacetValues", () => {
  it("orders measurements by their number, smallest first", () => {
    expect(["320 გრამი", "300 გრამი", "600 გრამი", "100 გრამი"].sort(compareFacetValues)).toEqual([
      "100 გრამი",
      "300 გრამი",
      "320 გრამი",
      "600 გრამი",
    ]);
    expect(["56 სმ", "53.96 სმ", "61 სმ", "132 სმ", "76.2 სმ"].sort(compareFacetValues)).toEqual([
      "53.96 სმ",
      "56 სმ",
      "61 სმ",
      "76.2 სმ",
      "132 სმ",
    ]);
  });

  it("falls back to alphabetical for words", () => {
    expect(["ღრმა ტალღა", "ბ", "ა"].sort(compareFacetValues)[0]).toBe("ა");
  });
});

describe("which standing filters are worth showing", () => {
  const product = (price: string, opts: { compareAt?: string; sold?: boolean } = {}) =>
    ({
      priceRange: { min: { amount: price, currencyCode: "GEL" } },
      variants: [
        {
          availableForSale: !opts.sold,
          price: { amount: price, currencyCode: "GEL" },
          compareAtPrice: opts.compareAt
            ? { amount: opts.compareAt, currencyCode: "GEL" }
            : undefined,
        },
      ],
    }) as never;

  it("offers a price tier only when it splits the products on screen", () => {
    // The live catalogue: ₾10 to ₾80. "under ₾100" would select everything, "under ₾25"
    // and "under ₾50" each divide it.
    expect(priceTiers([product("10.00"), product("30.00"), product("80.00")])).toEqual([25, 50]);
    // All one price: no chip can divide them.
    expect(priceTiers([product("30.00"), product("30.00")])).toEqual([]);
    expect(priceTiers([])).toEqual([]);
  });

  it("hides the sale toggle when nothing is discounted", () => {
    // Every product in the shop today — tapping it landed on "no results".
    expect(anyOnSale([product("10.00"), product("80.00")])).toBe(false);
    expect(anyOnSale([product("10.00", { compareAt: "20.00" })])).toBe(true);
  });

  it("hides the in-stock toggle when nothing is sold out", () => {
    expect(anySoldOut([product("10.00"), product("80.00")])).toBe(false);
    expect(anySoldOut([product("10.00", { sold: true })])).toBe(true);
  });
});

describe("colour, which the catalogue stores two ways", () => {
  // Shapes taken from the live catalogue: the ponytail carries its colour as a product
  // attribute, the braiding hair as a variant option group, and both call the group "ფერი".
  const byAttribute = (...values: string[]) =>
    ({ options: [], attributes: [{ key: "color", name: "ფერი", values }] }) as unknown as Product;
  const byOption = (...values: string[]) =>
    ({ options: [{ name: "ფერი", values }], attributes: [] }) as unknown as Product;

  const products = [byAttribute("სტაფილოსფერი", "შავი"), byOption("შავი", "მუქი ყავისფერი")];

  it("offers one row holding every colour, however each product stores it", () => {
    const facet = extractColorFacet(products);
    expect(facet?.key).toBe("color");
    // Labelled with what the catalogue calls the group, so the row needs no translation.
    expect(facet?.name).toBe("ფერი");
    expect(facet?.values).toEqual(["მუქი ყავისფერი", "სტაფილოსფერი", "შავი"]);
  });

  it("matches a colour against both shapes, so one chip means one colour", () => {
    // The bug this replaced: two chips both reading "შავი", each finding only its own half.
    expect(applyFilters(products, { ...EMPTY_FILTERS, colors: ["შავი"] })).toHaveLength(2);
    expect(applyFilters(products, { ...EMPTY_FILTERS, colors: ["სტაფილოსფერი"] })).toEqual([
      products[0],
    ]);
    expect(applyFilters(products, { ...EMPTY_FILTERS, colors: ["მუქი ყავისფერი"] })).toEqual([
      products[1],
    ]);
  });

  it("keeps colour out of the attribute rows, so it isn't offered twice", () => {
    expect(extractAttributeFacets(products).map((f) => f.key)).not.toContain("color");
  });

  it("stays quiet when there is nothing to choose between", () => {
    expect(extractColorFacet([byOption("შავი"), byAttribute("შავი")])).toBeNull();
    expect(extractColorFacet([])).toBeNull();
  });
});
