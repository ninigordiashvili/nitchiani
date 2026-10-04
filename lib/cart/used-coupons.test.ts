import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { isCouponUsed, markCouponUsed } from "./used-coupons";

beforeEach(() => {
  const store = new Map<string, string>();
  vi.stubGlobal("localStorage", {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, v),
    removeItem: (k: string) => void store.delete(k),
  });
});
afterEach(() => vi.unstubAllGlobals());

describe("used coupons", () => {
  it("remembers a spent code, whatever case it's typed in", () => {
    expect(isCouponUsed("WELCOME10")).toBe(false);
    markCouponUsed("welcome10");
    expect(isCouponUsed("WELCOME10")).toBe(true);
    expect(isCouponUsed(" welcome10 ")).toBe(true);
  });

  it("leaves other codes alone", () => {
    markCouponUsed("WELCOME10");
    expect(isCouponUsed("SPRING20")).toBe(false);
  });

  it("ignores empty values and survives storage being unavailable", () => {
    markCouponUsed(null);
    markCouponUsed("");
    expect(isCouponUsed("")).toBe(false);
    vi.stubGlobal("localStorage", {
      getItem: () => {
        throw new Error("blocked");
      },
      setItem: () => {
        throw new Error("blocked");
      },
    });
    expect(() => markCouponUsed("WELCOME10")).not.toThrow();
    expect(isCouponUsed("WELCOME10")).toBe(false);
  });
});
