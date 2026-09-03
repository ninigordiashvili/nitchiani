import { describe, expect, it } from "vitest";
import {
  applyFilters,
  EMPTY_FILTERS,
  extractAttributeFacets,
  parseAttributeParam,
  serializeAttributeParam,
} from "./filter";
import type { Product } from "../shopify/types";

const p = (handle: string, attrs: Product["attributes"]): Product =>
  ({
    handle,
    attributes: attrs,
    options: [],
    variants: [{ availableForSale: true, price: { amount: "80.00", currencyCode: "GEL" } }],
    priceRange: { min: { amount: "80.00", currencyCode: "GEL" }, max: { amount: "80.00", currencyCode: "GEL" } },
  }) as unknown as Product;

const curly = p("a", [{ key: "hair-type", name: "Hair type", values: ["Curly"] }]);
const straight = p("b", [{ key: "hair-type", name: "Hair type", values: ["Straight"] }]);
const both = p("c", [{ key: "hair-type", name: "Hair type", values: ["Curly", "Wavy"] }]);

describe("attribute facets", () => {
  it("offers an attribute once two distinct values exist", () => {
    expect(extractAttributeFacets([curly, straight])).toEqual([
      { key: "hair-type", name: "Hair type", values: ["Curly", "Straight"] },
    ]);
  });

  it("hides an attribute where every product shares one value", () => {
    // Every product matches, so the chip would filter nothing — noise, not a control.
    expect(extractAttributeFacets([curly, curly])).toEqual([]);
  });

  it("hides an attribute with no values at all", () => {
    // The shape of the tenant's current half-configured attribute: declared but empty.
    expect(extractAttributeFacets([p("x", [{ key: "k", name: "K", values: [] }]), straight])).toEqual([]);
  });

  it("ignores products carrying no attributes", () => {
    expect(extractAttributeFacets([p("x", undefined), curly])).toEqual([]);
  });
});

describe("filtering by attribute", () => {
  const all = [curly, straight, both];

  it("ORs values inside one attribute", () => {
    const out = applyFilters(all, { ...EMPTY_FILTERS, attributes: { "hair-type": ["Curly"] } });
    expect(out.map((x) => x.handle)).toEqual(["a", "c"]);
  });

  it("matches a product on any of its values", () => {
    const out = applyFilters(all, { ...EMPTY_FILTERS, attributes: { "hair-type": ["Wavy"] } });
    expect(out.map((x) => x.handle)).toEqual(["c"]);
  });

  it("ANDs across different attributes", () => {
    const withLength = p("d", [
      { key: "hair-type", name: "Hair type", values: ["Curly"] },
      { key: "length", name: "Length", values: ['22"'] },
    ]);
    const out = applyFilters([curly, withLength], {
      ...EMPTY_FILTERS,
      attributes: { "hair-type": ["Curly"], length: ['22"'] },
    });
    expect(out.map((x) => x.handle)).toEqual(["d"]);
  });

  it("an empty selection filters nothing", () => {
    expect(applyFilters(all, { ...EMPTY_FILTERS, attributes: { "hair-type": [] } })).toHaveLength(3);
  });
});

describe("url round trip", () => {
  it("survives serialize → parse", () => {
    const filters = { "hair-type": ["Curly", "Wavy"], length: ['22"'] };
    const raw = serializeAttributeParam(filters);
    expect(raw).toBe('hair-type:Curly~Wavy;length:22"');
    expect(parseAttributeParam(raw)).toEqual(filters);
  });

  it("drops the param entirely when nothing is selected", () => {
    expect(serializeAttributeParam({ "hair-type": [] })).toBeNull();
    expect(parseAttributeParam(null)).toEqual({});
  });

  it("ignores malformed input rather than throwing", () => {
    // A hand-edited or truncated URL must not break the page.
    expect(parseAttributeParam("garbage")).toEqual({});
    expect(parseAttributeParam("hair-type:")).toEqual({});
    expect(parseAttributeParam(";;")).toEqual({});
  });
});
