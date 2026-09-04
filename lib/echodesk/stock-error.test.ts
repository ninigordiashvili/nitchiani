import { describe, expect, it } from "vitest";
import { parseInsufficientStock } from "./stock-error";

describe("parseInsufficientStock", () => {
  it("reads the real rejection the backend sends", () => {
    // Verbatim from the server log.
    const raw =
      "[ErrorDetail(string='Insufficient stock for არიელი - ხელოვნური თმა. Available: 1, Requested: 2', code='invalid')]";
    expect(parseInsufficientStock(raw)).toEqual({
      product: "არიელი - ხელოვნური თმა",
      available: 1,
    });
  });

  it("reads the bare sentence too, in case the wrapper goes away", () => {
    expect(parseInsufficientStock("Insufficient stock for Bonnet. Available: 3, Requested: 8")).toEqual({
      product: "Bonnet",
      available: 3,
    });
  });

  it("keeps a product name containing a full stop", () => {
    // Anchoring on ". Available:" rather than the first period is what makes this work.
    expect(
      parseInsufficientStock("Insufficient stock for Ariel 2.0 Wax. Available: 2, Requested: 5"),
    ).toEqual({ product: "Ariel 2.0 Wax", available: 2 });
  });

  it("handles zero left", () => {
    expect(
      parseInsufficientStock("Insufficient stock for Durag. Available: 0, Requested: 1"),
    ).toEqual({ product: "Durag", available: 0 });
  });

  it("returns null for anything that isn't a stock complaint", () => {
    // The caller falls back to the generic message; it must never guess.
    expect(parseInsufficientStock(undefined)).toBeNull();
    expect(parseInsufficientStock("")).toBeNull();
    expect(parseInsufficientStock("Missing required fields: last_name")).toBeNull();
    expect(parseInsufficientStock("Insufficient stock for Bonnet.")).toBeNull();
    expect(parseInsufficientStock("Insufficient stock for . Available: 2")).toBeNull();
  });
});
