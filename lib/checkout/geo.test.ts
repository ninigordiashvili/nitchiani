import { describe, expect, it } from "vitest";
import { composeNotes, isUsableCoordinate, mapsLink, PICKUP_MARKER } from "./geo";

describe("mapsLink", () => {
  it("builds a link a courier can open", () => {
    expect(mapsLink(41.7151, 44.8271)).toBe("https://www.google.com/maps?q=41.715100,44.827100");
  });

  it("clamps precision to six decimals", () => {
    expect(mapsLink(41.71512345678, 44.82719999)).toBe(
      "https://www.google.com/maps?q=41.715123,44.827200",
    );
  });
});

describe("isUsableCoordinate", () => {
  it("accepts a Tbilisi pin", () => {
    expect(isUsableCoordinate(41.7151, 44.8271)).toBe(true);
  });

  it("rejects a missing half", () => {
    expect(isUsableCoordinate(41.7151, undefined)).toBe(false);
    expect(isUsableCoordinate(undefined, 44.8271)).toBe(false);
    expect(isUsableCoordinate()).toBe(false);
  });

  it("rejects Null Island, which is what a zeroed coordinate looks like", () => {
    expect(isUsableCoordinate(0, 0)).toBe(false);
  });

  it("rejects out-of-range and non-finite values", () => {
    expect(isUsableCoordinate(91, 44)).toBe(false);
    expect(isUsableCoordinate(41, 181)).toBe(false);
    expect(isUsableCoordinate(Number.NaN, 44)).toBe(false);
  });
});

describe("composeNotes", () => {
  const pin = "📍 https://www.google.com/maps?q=41.715100,44.827100";

  it("appends the pin below the customer's own note", () => {
    expect(composeNotes("Ring twice", 41.7151, 44.8271)).toBe(`Ring twice\n\n${pin}`);
  });

  it("sends the pin alone when there is no note", () => {
    expect(composeNotes(undefined, 41.7151, 44.8271)).toBe(pin);
    expect(composeNotes("   ", 41.7151, 44.8271)).toBe(pin);
  });

  it("leaves a typed-only address untouched", () => {
    // The common case: no key configured, or a building Places has never heard of.
    expect(composeNotes("Leave at reception")).toBe("Leave at reception");
  });

  it("returns undefined when there is nothing to send", () => {
    // So the caller omits `notes` entirely rather than posting an empty string.
    expect(composeNotes(undefined)).toBeUndefined();
    expect(composeNotes("")).toBeUndefined();
    expect(composeNotes("  ", 0, 0)).toBeUndefined();
  });
});

describe("composeNotes for collection", () => {
  it("marks the order so nobody sends a courier", () => {
    const out = composeNotes("Ring twice", undefined, undefined, true);
    expect(out?.startsWith(PICKUP_MARKER)).toBe(true);
    expect(out).toContain("Ring twice");
  });

  it("marks it even with no note of their own", () => {
    expect(composeNotes(undefined, undefined, undefined, true)).toBe(PICKUP_MARKER);
  });

  it("drops the map pin for collection", () => {
    // A pin is meaningless when nobody is travelling to it, and next to a pickup marker it
    // reads as a delivery address.
    const out = composeNotes(undefined, 41.7151, 44.8271, true);
    expect(out).toBe(PICKUP_MARKER);
    expect(out).not.toContain("google.com/maps");
  });

  it("still carries the pin for a delivery", () => {
    expect(composeNotes(undefined, 41.7151, 44.8271, false)).toContain("google.com/maps");
  });
});
