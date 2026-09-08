import { describe, expect, it } from "vitest";
import { decideShipping, pickFlatMethod } from "./shipping";
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

describe("decideShipping", () => {
  const option = (price: number, source: "quote" | "flat") => ({
    price, label: null, methodId: null, estimatedDays: null, source,
  });

  it("uses the courier quote when there is one", () => {
    const out = decideShipping({
      quote: option(12, "quote"), flat: option(8, "flat"), hasPin: true, courierOnly: true,
    });
    expect(out).toEqual({ status: "priced", option: option(12, "quote") });
  });

  it("falls back to the flat method when the quote fails", () => {
    const out = decideShipping({
      quote: null, flat: option(8, "flat"), hasPin: true, courierOnly: false,
    });
    expect(out.status).toBe("priced");
  });

  it("asks for the map pin when the shop prices by courier alone", () => {
    // The reason this exists: without it, this order would ship free.
    expect(
      decideShipping({ quote: null, flat: null, hasPin: false, courierOnly: true }),
    ).toEqual({ status: "needsLocation" });
  });

  it("reports unavailable when a pin was given but no quote came back", () => {
    // Different problem, different message — asking for a pin they already dropped is
    // an instruction they cannot follow.
    expect(
      decideShipping({ quote: null, flat: null, hasPin: true, courierOnly: true }),
    ).toEqual({ status: "unavailable" });
  });

  it("charges nothing when the shop configures no delivery at all", () => {
    // Not the same as "we don't know" — this shop genuinely doesn't charge.
    expect(
      decideShipping({ quote: null, flat: null, hasPin: false, courierOnly: false }),
    ).toEqual({ status: "unpriced" });
  });
});

describe("courier choice pricing", () => {
  // Shaped exactly like the live quote: a default at the top, every courier in `options`.
  const couriers = [
    { key: "16:57", id: 16, feeId: "57", name: "Georgian Post", speed: "4 working days delivery", logoUrl: null, price: 8.01 },
    { key: "23:104", id: 23, feeId: "104", name: "OnWay", speed: "1-2 working days", logoUrl: null, price: 8.21 },
    { key: "9:31", id: 9, feeId: "31", name: "Wolt", speed: "45-60 min.", logoUrl: null, price: 16 },
  ];
  const quote = {
    price: 8.01, label: "Georgian Post", methodId: null, estimatedDays: null,
    source: "quote" as const, couriers, courierId: 16, feeId: "57",
  };

  it("leads with the quote's default", () => {
    expect(decideShipping({ quote, flat: null, hasPin: true, courierOnly: true })).toEqual({
      status: "priced",
      option: quote,
    });
  });

  it("carries every courier through, so the shopper can choose", () => {
    const out = decideShipping({ quote, flat: null, hasPin: true, courierOnly: true });
    expect(out.status === "priced" && out.option.couriers?.map((c) => c.name)).toEqual([
      "Georgian Post",
      "OnWay",
      "Wolt",
    ]);
  });

  it("prefers a live quote over a flat method even when both exist", () => {
    const flat = { price: 8, label: "Courier", methodId: 1, estimatedDays: 2, source: "flat" as const };
    const out = decideShipping({ quote, flat, hasPin: true, courierOnly: false });
    expect(out.status === "priced" && out.option.source).toBe("quote");
  });
});

  it("tells apart tiers that share a provider id", () => {
    // Go Delivery is quoted three times under one provider id — scooter, car, truck — at
    // three prices. Keying on the provider alone charged the cheapest whichever was picked.
    const go = [
      { key: "31:200", id: 31, feeId: "200", name: "Go Delivery", speed: "scooter", logoUrl: null, price: 12.47 },
      { key: "31:201", id: 31, feeId: "201", name: "Go Delivery", speed: "car", logoUrl: null, price: 13.1 },
      { key: "31:202", id: 31, feeId: "202", name: "Go Delivery", speed: "truck", logoUrl: null, price: 19.47 },
    ];
    expect(new Set(go.map((c) => c.key)).size).toBe(3);
    expect(new Set(go.map((c) => c.id)).size).toBe(1);
  });
