import { describe, expect, it } from "vitest";
import { DUMMY_RAW_PRODUCTS, MAX_PRODUCT_IMAGES, localizeProduct } from "./dummy";

const products = DUMMY_RAW_PRODUCTS.map((p) => localizeProduct(p, "en"));

describe("product galleries", () => {
  it("never exceeds the image cap", () => {
    const over = products.filter((p) => p.images.length > MAX_PRODUCT_IMAGES);
    expect(over.map((p) => `${p.handle}=${p.images.length}`)).toEqual([]);
  });

  it("gives every product at least one image", () => {
    expect(products.filter((p) => p.images.length === 0)).toEqual([]);
  });

  it("leads the gallery with the featured image", () => {
    for (const p of products) {
      expect(p.images[0].url).toBe(p.featuredImage.url);
    }
  });

  it("has at least one product with a multi-shot gallery", () => {
    expect(products.some((p) => p.images.length > 1)).toBe(true);
  });

  it("gives repeated shots distinct alt text so screen readers can tell them apart", () => {
    for (const p of products.filter((x) => x.images.length > 1)) {
      const alts = p.images.map((i) => i.altText);
      expect(new Set(alts).size).toBe(alts.length);
    }
  });
});
