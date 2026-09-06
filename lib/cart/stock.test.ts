import { describe, expect, it } from "vitest";
import { clampToStock, isAtStockLimit } from "./stock";

describe("clampToStock", () => {
  it("caps a request at what the shop can ship", () => {
    // The exact case that failed at checkout: 2 requested, 1 available.
    expect(clampToStock(2, 1)).toBe(1);
    expect(clampToStock(7, 10)).toBe(7);
  });

  it("treats untracked stock as no ceiling, not as zero", () => {
    // Getting this backwards would make every untracked product unbuyable.
    expect(clampToStock(5, undefined)).toBe(5);
    expect(clampToStock(5, Number.NaN)).toBe(5);
  });

  it("returns zero when nothing is in stock", () => {
    expect(clampToStock(3, 0)).toBe(0);
  });

  it("never returns a negative or fractional quantity", () => {
    expect(clampToStock(-2, 5)).toBe(0);
    expect(clampToStock(0, 5)).toBe(0);
    expect(clampToStock(5, 2.7)).toBe(2);
  });
});

describe("isAtStockLimit", () => {
  it("is true once the line holds everything available", () => {
    expect(isAtStockLimit(1, 1)).toBe(true);
    expect(isAtStockLimit(2, 1)).toBe(true);
  });

  it("is false while there is headroom", () => {
    expect(isAtStockLimit(1, 10)).toBe(false);
  });

  it("is false when stock is untracked, so the control stays usable", () => {
    expect(isAtStockLimit(99, undefined)).toBe(false);
  });

  it("is true when nothing is in stock", () => {
    expect(isAtStockLimit(0, 0)).toBe(true);
  });
});
