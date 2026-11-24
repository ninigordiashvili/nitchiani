import { describe, expect, it } from "vitest";
import { newMarks, scrollPercent } from "./scroll";

describe("scrollPercent", () => {
  it("is 0 when the page fits the window", () => {
    expect(scrollPercent(0, 700, 800)).toBe(0);
  });
  it("measures against the scrollable distance", () => {
    expect(scrollPercent(500, 1800, 800)).toBe(50);
    expect(scrollPercent(5000, 1800, 800)).toBe(100);
  });
});

describe("newMarks", () => {
  it("returns each mark once", () => {
    const sent = new Set<number>();
    expect(newMarks(10, sent)).toEqual([]);
    const first = newMarks(30, sent);
    expect(first).toEqual([25]);
    first.forEach((m) => sent.add(m));
    expect(newMarks(30, sent)).toEqual([]);
    expect(newMarks(80, sent)).toEqual([50, 75]);
  });
});
