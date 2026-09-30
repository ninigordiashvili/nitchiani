import { describe, expect, it } from "vitest";
import { findGoneLines, type ProductLookup } from "./cart-check";
import type { EchoDeskProduct } from "./types";

const product = (id: number, extra: Partial<EchoDeskProduct> = {}): EchoDeskProduct => ({
  id,
  name: { en: `P${id}` },
  slug: `p-${id}`,
  price: "10",
  status: "active",
  ...extra,
});

const lookupFrom = (table: Record<number, ProductLookup>) => async (id: number) => table[id] ?? null;

describe("findGoneLines", () => {
  it("flags a product the backend says is gone", async () => {
    const gone = await findGoneLines(
      ["gid://echodesk/Product/1", "gid://echodesk/Product/7"],
      lookupFrom({ 1: "missing", 7: product(7) }),
    );
    expect(gone).toEqual(["gid://echodesk/Product/1"]);
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
    expect(gone).toEqual(["gid://echodesk/Product/7"]);
  });

  it("flags a variant its product no longer has, and keeps one it does", async () => {
    const gone = await findGoneLines(
      ["gid://echodesk/Variant/3?product=7", "gid://echodesk/Variant/4?product=7"],
      lookupFrom({ 7: product(7, { variants: [{ id: 4 }] }) }),
    );
    expect(gone).toEqual(["gid://echodesk/Variant/3?product=7"]);
  });

  it("flags a variant saved without its parent, and leaves other catalogues alone", async () => {
    const gone = await findGoneLines(
      ["gid://echodesk/Variant/3", "gid://nitchiani/Variant/silk-0"],
      lookupFrom({}),
    );
    expect(gone).toEqual(["gid://echodesk/Variant/3"]);
  });
});
