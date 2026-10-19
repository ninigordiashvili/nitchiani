import { describe, expect, it } from "vitest";
import { CATEGORY_HANDLES } from "../categories";
import {
  PRODUCT_CATEGORIES,
  categoriesFor,
  invalidCategoryHandles,
  subcategoryFor,
} from "./categories";
import { subcategoriesFor } from "../categories";

describe("product → category map", () => {
  it("only references categories that exist", () => {
    // A typo here wouldn't throw — the product would just quietly never appear in its
    // category, which is the kind of bug you find weeks later via a sales report.
    expect(invalidCategoryHandles()).toEqual([]);
  });

  it("places the live tenant's products", () => {
    // EchoDesk derives the slug from the SKU, so these read as product codes rather than
    // names. When a slug is renamed in the panel, this test is what catches the map going
    // stale — the product would otherwise just quietly stop appearing in its category.
    expect(categoriesFor("b-hs3089p-22")).toEqual(["hair-extensions"]); // არიელი 22″
    expect(categoriesFor("b-hs3226p-24")).toEqual(["hair-extensions"]); // ანა 24″
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

describe("the split inside hair extensions", () => {
  const ACCESSORIES = [
    "long_braided_ponytail_hair_extension_black",
    "decorative_hair_accessory",
    "braided__metal_ring_clasps_2_piece_set",
    "star_decorated_2_piece_set",
    "hair_accessory_metal_decorations",
  ];

  it("files the clip-in pieces under hair extensions, not loose under All products", () => {
    for (const slug of ACCESSORIES) expect(categoriesFor(slug)).toEqual(["hair-extensions"]);
  });

  it("tells the accessories apart from the hair", () => {
    for (const slug of ACCESSORIES) expect(subcategoryFor(slug, "hair")).toBe("accessories");
    expect(subcategoryFor("deep_wave_braiding_hair_extensions", "hair")).toBe("hair");
    expect(subcategoryFor("4_kinky_curly_55_88", "hair")).toBe("hair");
  });

  it("counts an unlisted product as hair rather than dropping it from both chips", () => {
    // The failure that matters: a new braiding hair nobody remembered to list here must
    // still show under one of the two chips, not vanish between them.
    expect(subcategoryFor("some-new-braiding-hair", "hair")).toBe("hair");
  });

  it("offers the split on hair extensions and nowhere else", () => {
    expect(subcategoriesFor("hair-extensions")?.options.map((o) => o.key)).toEqual([
      "hair",
      "accessories",
    ]);
    expect(subcategoriesFor("bonnets")).toBeNull();
  });
});
