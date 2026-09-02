import { describe, expect, it } from "vitest";
import { CATEGORY_HANDLES } from "../categories";
import { PRODUCT_CATEGORIES, categoriesFor, invalidCategoryHandles } from "./categories";

describe("product → category map", () => {
  it("only references categories that exist", () => {
    // A typo here wouldn't throw — the product would just quietly never appear in its
    // category, which is the kind of bug you find weeks later via a sales report.
    expect(invalidCategoryHandles()).toEqual([]);
  });

  it("places the live tenant's products", () => {
    expect(categoriesFor("prod-001")).toEqual(["braiding-wax"]);
    expect(categoriesFor("prod-002")).toEqual(["hair-extensions"]);
  });

  it("returns nothing for an unmapped product rather than guessing", () => {
    expect(categoriesFor("some-new-product")).toEqual([]);
  });

  it("keeps every mapped slug pointing somewhere", () => {
    for (const [slug, handles] of Object.entries(PRODUCT_CATEGORIES)) {
      expect(handles.length, `${slug} has no categories`).toBeGreaterThan(0);
      for (const h of handles) expect(CATEGORY_HANDLES).toContain(h);
    }
  });
});
