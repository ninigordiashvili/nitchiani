import { describe, expect, it } from "vitest";
import { adaptAttributes, adaptProduct, localizeUnit, parseEchoDeskGid, pick } from "./adapt";
import type { EchoDeskProduct } from "./types";
// Captured verbatim from the live tenant (nitchiani.api.echodesk.ge, product 1) so the
// adapter is tested against a real payload rather than an idealised one.
import live from "./__fixtures__.json";

const product = live as unknown as EchoDeskProduct;

describe("adaptProduct — real tenant payload", () => {
  it("produces a Product the storefront can render", () => {
    const p = adaptProduct(product, "ka");
    expect(p.handle).toBe("prod-001");
    expect(p.title).toBe("თმის ჟელე");
    expect(p.featuredImage.url).toMatch(/^https:\/\//);
    expect(p.images.length).toBeGreaterThan(0);
    expect(p.priceRange.min).toEqual({ amount: "10.00", currencyCode: "GEL" });
  });

  it("always yields one sellable variant, even with no variants defined", () => {
    expect(product.variants).toEqual([]);
    const p = adaptProduct(product, "en");
    expect(p.variants).toHaveLength(1);
    expect(p.variants[0].availableForSale).toBe(true);
    // The id must survive AND be tagged as a product, so checkout sends it as product_id
    // rather than variant_id.
    expect(parseEchoDeskGid(p.variants[0].id)).toEqual({ kind: "product", id: 1, productId: 1 });
  });

  it("falls back to the single list image when the detail gallery is absent", () => {
    const listRow = { ...product };
    delete listRow.images;
    const p = adaptProduct(listRow as EchoDeskProduct, "en");
    expect(p.images).toHaveLength(1);
    expect(p.featuredImage.url).toBe(product.image);
  });

  it("marks an out-of-stock product unsellable", () => {
    const p = adaptProduct({ ...product, is_in_stock: false, quantity: 0 }, "en");
    expect(p.variants[0].availableForSale).toBe(false);
  });
});

describe("pick", () => {
  it("prefers the active locale, then English, then anything present", () => {
    expect(pick({ en: "Wax", ka: "ჟელე" }, "ka")).toBe("ჟელე");
    expect(pick({ en: "Wax" }, "ka")).toBe("Wax");
    expect(pick({ ka: "ჟელე" }, "en")).toBe("ჟელე");
    expect(pick(undefined, "en")).toBe("");
    // An empty string for the active locale must not win over a real English value.
    expect(pick({ en: "Wax", ka: "" }, "ka")).toBe("Wax");
  });
});

describe("parseEchoDeskGid", () => {
  it("distinguishes product rows from variant rows", () => {
    expect(parseEchoDeskGid("gid://echodesk/Product/7")).toEqual({ kind: "product", id: 7, productId: 7 });
    expect(parseEchoDeskGid("gid://echodesk/Variant/3?product=7")).toEqual({
      kind: "variant",
      id: 3,
      productId: 7,
    });
  });

  it("keeps a variant's parent product apart from the variant itself", () => {
    // Checkout sent the variant id as `product_id`, naming an unrelated product or none.
    const p = adaptProduct(
      { id: 7, name: { en: "Wax" }, slug: "wax", price: "10", variants: [{ id: 3, name: { en: "150ml" } }] },
      "en",
    );
    expect(parseEchoDeskGid(p.variants[0].id)).toEqual({ kind: "variant", id: 3, productId: 7 });
  });

  it("marks a variant saved without its parent as unorderable", () => {
    expect(parseEchoDeskGid("gid://echodesk/Variant/7")).toEqual({ kind: "variant", id: 7, productId: null });
    expect(parseEchoDeskGid("gid://echodesk/Product/7?product=9")).toBeNull();
  });

  it("rejects anything that isn't an EchoDesk gid", () => {
    // Sample-catalog and Shopify ids must not be mistaken for EchoDesk ones at checkout.
    expect(parseEchoDeskGid("gid://nitchiani/Variant/silk-bonnet-noir-0")).toBeNull();
    expect(parseEchoDeskGid("gid://shopify/ProductVariant/123")).toBeNull();
    expect(parseEchoDeskGid("")).toBeNull();
  });
});

describe("attribute units", () => {
  const numeric = (unit: string | undefined, value: unknown) => [
    {
      attribute: { key: "weight", name: { ka: "წონა", en: "Weight" }, attribute_type: "number", is_filterable: true, unit },
      value,
    },
  ];

  it("appends the unit EchoDesk declares", () => {
    const [attr] = adaptAttributes(numeric("გრამი", 300) as never, "ka");
    expect(attr.values).toEqual(["300 გრამი"]);
    expect(attr.unit).toBe("გრამი");
  });

  it("leaves the value alone when no unit is set", () => {
    // Select attributes come back with unit: "" — appending would give "1B " with a
    // trailing space that shows up in the filter chip.
    const [attr] = adaptAttributes(numeric("", 300) as never, "ka");
    expect(attr.values).toEqual(["300"]);
    expect(attr.unit).toBeUndefined();
  });

  it("ignores a unit that is only whitespace", () => {
    const [attr] = adaptAttributes(numeric("   ", 55) as never, "ka");
    expect(attr.values).toEqual(["55"]);
  });

  it("translates a Georgian unit on the English site", () => {
    // EchoDesk keeps the unit as one string, typed in Georgian — this read "150 მლ" in English.
    const [attr] = adaptAttributes(numeric("მლ", 150) as never, "en");
    expect(attr.values).toEqual(["150 ml"]);
  });

  it("keeps the Georgian unit on the Georgian site", () => {
    const [attr] = adaptAttributes(numeric("მლ", 150) as never, "ka");
    expect(attr.values).toEqual(["150 მლ"]);
  });
});

describe("localizeUnit", () => {
  it("reads through an abbreviation dot", () => {
    expect(localizeUnit("მლ.", "en")).toBe("ml");
    expect(localizeUnit("გრამი", "en")).toBe("g");
  });

  it("passes an unknown unit through rather than dropping it", () => {
    expect(localizeUnit("კოლოფი", "en")).toBe("კოლოფი");
  });
});

describe("variants as choices", () => {
  const withVariants = (variants: unknown[]) =>
    adaptProduct(
      { id: 25, name: { en: "Soft body wave" }, slug: "soft", price: "80", variants } as never,
      "ka",
    );

  it("offers the variant's own name when EchoDesk recorded no attributes", () => {
    // The product editor lets a variant be saved with a name and nothing else; without this
    // the picker had no options to show and hid itself, so neither colour could be chosen.
    const p = withVariants([
      { id: 1, name: { ka: "Ombre" }, price: "80", quantity: 1 },
      { id: 2, name: { ka: "BLONDE" }, price: "80", quantity: 1 },
    ]);
    expect(p.options).toEqual([{ name: "ვარიანტი", values: ["Ombre", "BLONDE"] }]);
    expect(p.variants.map((v) => v.selectedOptions)).toEqual([
      [{ name: "ვარიანტი", value: "Ombre" }],
      [{ name: "ვარიანტი", value: "BLONDE" }],
    ]);
  });

  it("prefers the merchant's own attribute when there is one", () => {
    const p = withVariants([
      {
        id: 1,
        name: { ka: "შავი" },
        price: "80",
        quantity: 1,
        attribute_values: [{ attribute: { name: { ka: "ფერი" } }, value: "შავი" }],
      },
    ]);
    expect(p.options).toEqual([{ name: "ფერი", values: ["შავი"] }]);
  });
});

describe("variant photos", () => {
  const withVariants = (variants: unknown[]) =>
    adaptProduct(
      {
        id: 25,
        name: { en: "Soft body wave", ka: "რბილი ტალღა" },
        slug: "soft",
        price: "80",
        image: "https://cdn/default.jpg",
        variants,
      } as never,
      "ka",
    );

  it("carries a variant's own photo, so the gallery and the bag can show it", () => {
    const p = withVariants([
      { id: 1, name: { ka: "შავი" }, price: "80", quantity: 1, image: "https://cdn/black.jpg" },
      { id: 2, name: { ka: "ქერა" }, price: "80", quantity: 1 },
    ]);
    expect(p.variants[0].image).toEqual({
      url: "https://cdn/black.jpg",
      altText: "შავი — რბილი ტალღა",
      width: 900,
      height: 1125,
    });
    // No photo of its own: callers fall back to the product's, so this stays absent rather
    // than becoming an <Image> with an empty src.
    expect(p.variants[1].image).toBeUndefined();
  });
});

describe("missing photos", () => {
  // EchoDesk sends "" rather than null for a product nobody has photographed — product 17, the
  // wide-strap durag, is one. Passed through, `<Image src="">` logged a ReactDOM.preload error
  // for every card on the page and showed a broken image in each.
  it("falls back to the placeholder when the only photo is an empty string", () => {
    const p = adaptProduct(
      { id: 17, name: { ka: "დურაგი" }, slug: "durag", price: "25", image: "" } as never,
      "ka",
    );
    expect(p.featuredImage.url).toBe("/products/placeholder.png");
    expect(p.images).toEqual([p.featuredImage]);
  });

  it("uses the variants' own photos when the product itself has none", () => {
    // How the wide-strap durag is stocked: no product image, one photo per colour.
    const p = adaptProduct(
      {
        id: 17,
        name: { ka: "დურაგი" },
        slug: "durag",
        price: "10",
        image: "",
        variants: [
          { id: 3, name: { ka: "შავი" }, price: "10", quantity: 3, image: "https://cdn/black.png" },
          { id: 4, name: { ka: "წითელი" }, price: "10", quantity: 2, image: "https://cdn/red.png" },
        ],
      } as never,
      "ka",
    );
    expect(p.featuredImage.url).toBe("https://cdn/black.png");
    expect(p.images.map((i) => i.url)).toEqual(["https://cdn/black.png", "https://cdn/red.png"]);
  });

  it("drops a blank gallery entry rather than rendering it", () => {
    const p = adaptProduct(
      {
        id: 17,
        name: { ka: "დურაგი" },
        slug: "durag",
        price: "25",
        images: [{ image: "  ", sort_order: 1 }, { image: "https://cdn/real.jpg", sort_order: 2 }],
      } as never,
      "ka",
    );
    expect(p.images.map((i) => i.url)).toEqual(["https://cdn/real.jpg"]);
  });
});

describe("merchant copy arriving raw", () => {
  it("trims a name the CRM saved with a trailing space", () => {
    // Invisible in EchoDesk, visible on the card as a gap before the price.
    const p = adaptProduct(
      { id: 25, name: { ka: "ტალღოვანი თმის დაგრძელება " }, slug: "wave", price: "80" } as never,
      "ka",
    );
    expect(p.title).toBe("ტალღოვანი თმის დაგრძელება");
  });

  it("drops a form-field heading pasted in with the copy", () => {
    // One product's English short description opens with the literal line "Short Description",
    // which the page printed as its first paragraph and Google used to open the snippet.
    const p = adaptProduct(
      {
        id: 12,
        name: { en: "Bonnets" },
        slug: "bonnets",
        price: "25",
        short_description: { en: "Short Description\nProtect your hair while sleeping." },
      } as never,
      "en",
    );
    expect(p.shortDescription).toBe("Protect your hair while sleeping.");
  });

  it("keeps a sentence that merely starts with the word", () => {
    const p = adaptProduct(
      {
        id: 13,
        name: { en: "Thing" },
        slug: "thing",
        price: "25",
        short_description: { en: "Description of the fabric follows.\nIt is satin." },
      } as never,
      "en",
    );
    expect(p.shortDescription?.startsWith("Description of the fabric")).toBe(true);
  });
});
