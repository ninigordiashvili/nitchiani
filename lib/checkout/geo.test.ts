import { describe, expect, it } from "vitest";
import { isUsableCoordinate } from "./geo";

describe("isUsableCoordinate", () => {
  it("accepts a Tbilisi pin", () => {
    expect(isUsableCoordinate(41.7151, 44.8271)).toBe(true);
  });

  it("rejects a missing half", () => {
    // Half a pin can't be sent: `latitude` without `longitude` is not a place.
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
