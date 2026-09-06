import { describe, expect, it } from "vitest";
import { recommendationPoolSize, selectRecommendations } from "./recommendations";
import type { Product } from "../shopify/types";

const product = (handle: string, availability: boolean[]): Product =>
  ({
    handle,
    variants: availability.map((availableForSale, i) => ({
      id: `${handle}-${i}`,
      availableForSale,
      price: { amount: "80.00", currencyCode: "GEL" },
    })),
  }) as unknown as Product;

const inStock = (h: string) => product(h, [true]);
const soldOut = (h: string) => product(h, [false]);

describe("selectRecommendations", () => {
  it("drops sold-out products", () => {
    const out = selectRecommendations([inStock("a"), soldOut("b"), inStock("c")], 4);
    expect(out.map((p) => p.handle)).toEqual(["a", "c"]);
  });

  it("keeps a product where only some variants are gone", () => {
    // One colour sold out doesn't make the product unbuyable.
    const partial = product("d", [false, true]);
    expect(selectRecommendations([partial], 4).map((p) => p.handle)).toEqual(["d"]);
  });

  it("drops a product whose every variant is gone", () => {
    expect(selectRecommendations([product("e", [false, false])], 4)).toEqual([]);
  });

  it("drops a product with no variants at all", () => {
    expect(selectRecommendations([product("f", [])], 4)).toEqual([]);
  });

  it("still fills the rail when earlier entries are sold out", () => {
    // The point of over-fetching: two sold-out leaders must not cost us two slots.
    const pool = [soldOut("a"), soldOut("b"), inStock("c"), inStock("d"), inStock("e")];
    expect(selectRecommendations(pool, 2).map((p) => p.handle)).toEqual(["c", "d"]);
  });

  it("preserves the order it was given", () => {
    const pool = [inStock("z"), inStock("y"), inStock("x")];
    expect(selectRecommendations(pool, 3).map((p) => p.handle)).toEqual(["z", "y", "x"]);
  });

  it("returns nothing for a non-positive limit", () => {
    expect(selectRecommendations([inStock("a")], 0)).toEqual([]);
    expect(selectRecommendations([inStock("a")], -1)).toEqual([]);
  });

  it("returns an empty list rather than throwing on an empty catalogue", () => {
    expect(selectRecommendations([], 4)).toEqual([]);
  });
});

describe("recommendationPoolSize", () => {
  it("fetches several times what it shows, so filtering has slack", () => {
    expect(recommendationPoolSize(4)).toBe(12);
    expect(recommendationPoolSize(8)).toBe(24);
  });

  it("never asks for a pool too thin to survive filtering", () => {
    expect(recommendationPoolSize(1)).toBe(12);
    expect(recommendationPoolSize(2)).toBe(12);
  });
});
