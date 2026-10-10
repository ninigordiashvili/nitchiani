import { describe, expect, it } from "vitest";
import { checkCartLines, findGoneLines, type ProductLookup } from "./cart-check";
import type { EchoDeskProduct } from "./types";

const product = (id: number, extra: Partial<EchoDeskProduct> = {}): EchoDeskProduct => ({
  id,
  name: { en: `P${id}` },
  slug: `p-${id}`,
  price: "10",
  status: "active",
  quantity: 5,
  ...extra,
});

const lookupFrom = (table: Record<number, ProductLookup>) => async (id: number) => table[id] ?? null;

describe("findGoneLines", () => {
  it("flags a product the backend says is gone", async () => {
    const gone = await findGoneLines(
      ["gid://echodesk/Product/1", "gid://echodesk/Product/7"],
      lookupFrom({ 1: "missing", 7: product(7) }),
    );
    expect(gone).toEqual([{ variantId: "gid://echodesk/Product/1", reason: "unavailable" }]);
  });

  it("never removes a line it couldn't check", async () => {
    // A failed request is not an answer; treating it as one would empty bags on a blip.
    expect(await findGoneLines(["gid://echodesk/Product/1"], lookupFrom({ 1: null }))).toEqual([]);
  });

  it("flags a product that is switched off", async () => {
    const gone = await findGoneLines(
      ["gid://echodesk/Product/7"],
      lookupFrom({ 7: product(7, { status: "draft" }) }),
    );
    expect(gone).toEqual([{ variantId: "gid://echodesk/Product/7", reason: "unavailable" }]);
  });

  it("flags a variant its product no longer has, and keeps one it does", async () => {
    const gone = await findGoneLines(
      ["gid://echodesk/Variant/3?product=7", "gid://echodesk/Variant/4?product=7"],
      lookupFrom({ 7: product(7, { variants: [{ id: 4, quantity: 2 }] }) }),
    );
    expect(gone).toEqual([{ variantId: "gid://echodesk/Variant/3?product=7", reason: "unavailable" }]);
  });

  it("flags a variant saved without its parent, and leaves other catalogues alone", async () => {
    const gone = await findGoneLines(
      ["gid://echodesk/Variant/3", "gid://nitchiani/Variant/silk-0"],
      lookupFrom({}),
    );
    expect(gone).toEqual([{ variantId: "gid://echodesk/Variant/3", reason: "unavailable" }]);
  });
});

describe("sold out since it went in the bag", () => {
  it("flags a product with nothing left, so checkout can't be blocked by it", async () => {
    expect(
      await findGoneLines(["gid://echodesk/Product/7"], lookupFrom({ 7: product(7, { quantity: 0 }) })),
    ).toEqual([{ variantId: "gid://echodesk/Product/7", reason: "soldOut" }]);
    expect(
      await findGoneLines(["gid://echodesk/Product/7"], lookupFrom({ 7: product(7, { is_in_stock: false }) })),
    ).toEqual([{ variantId: "gid://echodesk/Product/7", reason: "soldOut" }]);
  });

  it("flags a sold-out variant, and keeps one still in stock", async () => {
    const gone = await findGoneLines(
      ["gid://echodesk/Variant/3?product=7", "gid://echodesk/Variant/4?product=7"],
      lookupFrom({ 7: product(7, { variants: [{ id: 3, quantity: 0 }, { id: 4, quantity: 2 }] }) }),
    );
    expect(gone).toEqual([{ variantId: "gid://echodesk/Variant/3?product=7", reason: "soldOut" }]);
  });

  it("leaves a line alone when the backend doesn't track its stock", async () => {
    expect(
      await findGoneLines(
        ["gid://echodesk/Product/7"],
        lookupFrom({ 7: { id: 7, name: { en: "P7" }, slug: "p-7", price: "10", status: "active" } }),
      ),
    ).toEqual([]);
  });
});

describe("stock refresh", () => {
  // The bag keeps the limit each line was added with. With one or two units in stock, a bag
  // left overnight routinely asks for more than exists — and the only thing that ever said so
  // was EchoDesk refusing the whole order at the last step.
  const lookup = async (id: number) =>
    id === 25
      ? ({ id: 25, quantity: 7, variants: [{ id: 1, quantity: 2 }] } as never)
      : ({ id: 30, quantity: 1 } as never);

  it("reports what is left of each line", async () => {
    const { stock, gone } = await checkCartLines(
      ["gid://echodesk/Variant/1?product=25", "gid://echodesk/Product/30"],
      lookup,
    );
    expect(gone).toEqual([]);
    expect(stock).toEqual([
      { variantId: "gid://echodesk/Variant/1?product=25", available: 2 },
      { variantId: "gid://echodesk/Product/30", available: 1 },
    ]);
  });

  it("says nothing about a line it had to remove", async () => {
    const { gone, stock } = await checkCartLines(
      ["gid://echodesk/Product/40"],
      async () => ({ id: 40, quantity: 0 }) as never,
    );
    expect(gone).toEqual([{ variantId: "gid://echodesk/Product/40", reason: "soldOut" }]);
    expect(stock).toEqual([]);
  });

  it("leaves the limit alone when the backend doesn't count stock", async () => {
    const { stock } = await checkCartLines(
      ["gid://echodesk/Product/50"],
      async () => ({ id: 50 }) as never,
    );
    expect(stock).toEqual([]);
  });
});
