import { describe, expect, it } from "vitest";
import { pickFlatMethod } from "./shipping";
import type { EchoDeskShippingMethod } from "./types";

const method = (over: Partial<EchoDeskShippingMethod> = {}): EchoDeskShippingMethod => ({
  id: 1,
  name: { en: "Courier", ka: "კურიერი" },
  price: "5.00",
  is_active: true,
  estimated_days: 2,
  position: 0,
  ...over,
});

describe("pickFlatMethod", () => {
  it("charges the configured price", () => {
    expect(pickFlatMethod([method()], "ka", 100)).toEqual({
      price: 5,
      label: "კურიერი",
      methodId: 1,
      estimatedDays: 2,
      source: "flat",
    });
  });

  it("ignores the tenant's blank placeholder", () => {
    // Exactly what is configured today: created and never filled in. An unlabelled charge on
    // the bill is worse than no delivery line at all.
    expect(pickFlatMethod([method({ name: { en: "", ka: "" }, price: "0.00" })], "ka", 100)).toBeNull();
  });

  it("returns null when the tenant has no methods", () => {
    expect(pickFlatMethod([], "ka", 100)).toBeNull();
  });

  it("skips inactive methods", () => {
    expect(pickFlatMethod([method({ is_active: false })], "ka", 100)).toBeNull();
  });

  it("goes free once the threshold is met", () => {
    const m = [method({ free_shipping_threshold: "150.00" })];
    expect(pickFlatMethod(m, "ka", 149.99)?.price).toBe(5);
    expect(pickFlatMethod(m, "ka", 150)?.price).toBe(0);
  });

  it("takes the lowest position when several are configured", () => {
    const cheap = method({ id: 2, position: 0, price: "3.00", name: { en: "Standard", ka: "სტანდარტული" } });
    const fast = method({ id: 3, position: 1, price: "9.00", name: { en: "Express", ka: "ექსპრესი" } });
    expect(pickFlatMethod([fast, cheap], "ka", 100)?.methodId).toBe(2);
  });

  it("falls back to the other language rather than showing an empty label", () => {
    expect(pickFlatMethod([method({ name: { en: "Courier", ka: "" } })], "ka", 100)?.label).toBe("Courier");
  });

  it("rejects a malformed price instead of charging NaN", () => {
    expect(pickFlatMethod([method({ price: "abc" })], "ka", 100)).toBeNull();
    expect(pickFlatMethod([method({ price: "-5.00" })], "ka", 100)).toBeNull();
  });
});
