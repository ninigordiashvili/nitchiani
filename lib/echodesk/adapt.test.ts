import { describe, expect, it } from "vitest";
import { adaptProduct, parseEchoDeskGid, pick } from "./adapt";
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
    expect(parseEchoDeskGid(p.variants[0].id)).toEqual({ kind: "product", id: 1 });
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
    expect(parseEchoDeskGid("gid://echodesk/Product/7")).toEqual({ kind: "product", id: 7 });
    expect(parseEchoDeskGid("gid://echodesk/Variant/7")).toEqual({ kind: "variant", id: 7 });
  });

  it("rejects anything that isn't an EchoDesk gid", () => {
    // Sample-catalog and Shopify ids must not be mistaken for EchoDesk ones at checkout.
    expect(parseEchoDeskGid("gid://nitchiani/Variant/silk-bonnet-noir-0")).toBeNull();
    expect(parseEchoDeskGid("gid://shopify/ProductVariant/123")).toBeNull();
    expect(parseEchoDeskGid("")).toBeNull();
  });
});
