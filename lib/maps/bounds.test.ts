import { describe, expect, it } from "vitest";
import { GEORGIA_BOUNDS, isInGeorgia } from "./bounds";

describe("isInGeorgia", () => {
  it("accepts the cities the store actually delivers to", () => {
    expect(isInGeorgia(41.7151, 44.8271)).toBe(true); // Tbilisi
    expect(isInGeorgia(41.6168, 41.6367)).toBe(true); // Batumi
    expect(isInGeorgia(42.2662, 42.7180)).toBe(true); // Kutaisi
    expect(isInGeorgia(41.8386, 46.2758)).toBe(true); // Lagodekhi, far east
    expect(isInGeorgia(42.5088, 44.6265)).toBe(true); // Stepantsminda, far north
  });

  it("rejects neighbours and anywhere further", () => {
    expect(isInGeorgia(40.4093, 49.8671)).toBe(false); // Baku
    expect(isInGeorgia(40.1792, 44.4991)).toBe(false); // Yerevan
    expect(isInGeorgia(43.5855, 39.7231)).toBe(false); // Sochi
    expect(isInGeorgia(48.8566, 2.3522)).toBe(false); // Paris
  });

  it("rejects a zeroed or malformed coordinate", () => {
    expect(isInGeorgia(0, 0)).toBe(false);
    expect(isInGeorgia(Number.NaN, 44.8)).toBe(false);
    expect(isInGeorgia(41.7, Number.POSITIVE_INFINITY)).toBe(false);
  });

  it("treats the boundary itself as inside", () => {
    // The box is rounded outward, so an address sitting exactly on the edge is still ours.
    expect(isInGeorgia(GEORGIA_BOUNDS.south, GEORGIA_BOUNDS.west)).toBe(true);
    expect(isInGeorgia(GEORGIA_BOUNDS.north, GEORGIA_BOUNDS.east)).toBe(true);
  });
});
