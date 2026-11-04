import { describe, expect, it } from "vitest";
import { CATEGORY_HANDLES } from "../categories";
import {
  PRODUCT_CATEGORIES,
  categoriesFor,
  invalidCategoryHandles,
  resolveCategories,
  resolveSubcategory,
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
    for (const slug of ACCESSORIES) expect(subcategoryFor(slug, "braids")).toBe("clip-in");
    expect(subcategoryFor("deep_wave_braiding_hair_extensions", "braids")).toBe("braids");
    expect(subcategoryFor("4_kinky_curly_55_88", "braids")).toBe("braids");
  });

  it("counts an unlisted product as hair rather than dropping it from both chips", () => {
    // The failure that matters: a new braiding hair nobody remembered to list here must
    // still show under one of the two chips, not vanish between them.
    expect(subcategoryFor("some-new-braiding-hair", "braids")).toBe("braids");
  });

  it("offers the split on hair extensions and nowhere else", () => {
    expect(subcategoriesFor("hair-extensions")?.options.map((o) => o.key)).toEqual([
      "clip-in",
      "braids",
      "curls",
    ]);
    expect(subcategoriesFor("bonnets")).toBeNull();
  });
});

describe("inferring a category from the product's name", () => {
  const cat = (slug: string, ...names: string[]) => resolveCategories(slug, names);

  it("files a new synthetic hair under hair extensions with no map entry", () => {
    // The reported case: both are live, unmapped, and used to appear only under All products.
    expect(cat("synthetic_braiding_hair_blue", "Synthetic Braiding Hair – Blue", "ხელოვნური თმა ნაწნავებისთვის – ლურჯი")).toEqual(["hair-extensions"]);
    expect(cat("braiding_hair", "Synthetic Braiding Hair", "ხელოვნური თმა ნაწნავებისთვის")).toEqual(["hair-extensions"]);
  });

  it("puts the specific categories ahead of hair extensions, whose words they share", () => {
    expect(cat("x", "Satin Bonnet for Hair")).toEqual(["bonnets"]);
    expect(cat("x", "ატლასის ქუდი თმისთვის")).toEqual(["bonnets"]);
    expect(cat("x", "Satin Durag Wave Cap")).toEqual(["durags"]);
    expect(cat("x", "Hair Wax, Ultra Hold")).toEqual(["hair-care"]);
    expect(cat("x", "თმის ცვილი")).toEqual(["hair-care"]);
  });

  it("matches Latin words whole, not inside other words", () => {
    expect(cat("x", "Angel figurine")).toEqual([]);
  });

  it("leaves a product it can't read uncategorised rather than guessing", () => {
    expect(cat("gift-card", "Gift card")).toEqual([]);
  });

  it("lets the manual map override what the name says", () => {
    expect(cat("long_braided_ponytail_hair_extension_black", "Bonnet")).toEqual(["hair-extensions"]);
  });
});

describe("telling braiding hair from afro curls", () => {
  const sub = (slug: string, ...names: string[]) => resolveSubcategory(slug, names, "braids");
  it("sends curl words to curls, even in a braiding hair's name", () => {
    expect(sub("x", "Kinky Curly Hair Extensions")).toBe("curls");
    expect(sub("x", "Curly Braiding Hair – Deep Wave")).toBe("curls");
    expect(sub("76_2_deep_wave_ocean_wave", "76.2cm Curly Braiding Hair")).toBe("braids"); // pinned
    expect(sub("x", "ხვეული თმა")).toBe("curls");
  });
  it("keeps straight braiding hair under braids, and lets the override win", () => {
    expect(sub("x", "Synthetic Braiding Hair")).toBe("braids");
    expect(sub("decorative_hair_accessory", "Wavy Hair Extension")).toBe("clip-in");
  });
});

describe("telling clip-in pieces from loose hair", () => {
  const sub = (...names: string[]) => resolveSubcategory("new-slug", names, "braids");
  it("files a new accessory under clip-in with no map entry, even when named for its curls", () => {
    expect(sub("Braided Hair Accessory with Metal Decorations")).toBe("clip-in");
    expect(sub("Wavy Hair Extension Clip")).toBe("clip-in");
    expect(sub("თმის სამაგრი — ტალღოვანი")).toBe("clip-in");
  });
  it("leaves loose hair alone", () => {
    expect(sub("Synthetic Braiding Hair")).toBe("braids");
    expect(sub("Kinky Curly Hair Extensions")).toBe("curls");
  });
});
