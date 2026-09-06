import { describe, expect, it } from "vitest";
import { BUNDLES, bundleForCoupon, bundleShortfall, bundleUnitsInCart } from "./bundles";

const ariel = BUNDLES.find((b) => b.id === "ariel-3")!;
const line = (productHandle: string, quantity: number) => ({ productHandle, quantity });

describe("bundleForCoupon", () => {
  it("finds the offer a code belongs to, whatever the casing", () => {
    expect(bundleForCoupon("ARIEL15")?.id).toBe("ariel-3");
    expect(bundleForCoupon(" ariel15 ")?.id).toBe("ariel-3");
  });

  it("returns null for a code with no quantity condition", () => {
    expect(bundleForCoupon("WELCOME10")).toBeNull();
  });
});

describe("bundleUnitsInCart", () => {
  it("counts across every handle the offer accepts", () => {
    // Both Ariel listings count towards the same three packs.
    expect(bundleUnitsInCart(ariel, [line("prod-002", 2), line("a", 1)])).toBe(3);
  });

  it("ignores products outside the offer", () => {
    expect(bundleUnitsInCart(ariel, [line("prod-001", 9), line("a", 1)])).toBe(1);
  });
});

describe("bundleShortfall", () => {
  it("is zero once the bag holds enough", () => {
    expect(bundleShortfall(ariel, [line("prod-002", 3)])).toBe(0);
    expect(bundleShortfall(ariel, [line("prod-002", 5)])).toBe(0);
  });

  it("reports what's missing after a pack is removed", () => {
    // The reported bug: 3 packs qualify, then one is removed.
    expect(bundleShortfall(ariel, [line("prod-002", 2)])).toBe(1);
  });

  it("counts the whole offer as missing for an unrelated bag", () => {
    expect(bundleShortfall(ariel, [line("prod-001", 4)])).toBe(3);
    expect(bundleShortfall(ariel, [])).toBe(3);
  });

  it("is zero for an offer that has no quantity condition", () => {
    // A "one of each" bundle isn't judged on units.
    expect(bundleShortfall({ ...ariel, minQuantity: undefined }, [])).toBe(0);
  });
});
