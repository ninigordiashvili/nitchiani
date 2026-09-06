import { describe, expect, it } from "vitest";
import { DEFAULT_SORT, SORT_KEYS, applySort, isSortKey } from "./filter";
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
