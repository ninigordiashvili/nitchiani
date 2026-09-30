import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { forgetPendingPayment, loadPendingPayment, rememberPendingPayment } from "./pending-payment";

beforeEach(() => {
  const store = new Map<string, string>();
  vi.stubGlobal("localStorage", {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, v),
    removeItem: (k: string) => void store.delete(k),
  });
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe("pending payment record", () => {
  it("remembers the order the bag went into, until forgotten", () => {
    rememberPendingPayment("tok");
    expect(loadPendingPayment()?.token).toBe("tok");
    forgetPendingPayment();
    expect(loadPendingPayment()).toBeNull();
  });

  it("expires a payment that never finished", () => {
    vi.useFakeTimers();
    rememberPendingPayment("tok");
    vi.advanceTimersByTime(25 * 60 * 60 * 1000);
    expect(loadPendingPayment()).toBeNull();
  });

  it("survives storage being unavailable", () => {
    vi.stubGlobal("localStorage", {
      getItem: () => {
        throw new Error("blocked");
      },
      setItem: () => {
        throw new Error("blocked");
      },
      removeItem: () => {
        throw new Error("blocked");
      },
    });
    expect(() => rememberPendingPayment("tok")).not.toThrow();
    expect(loadPendingPayment()).toBeNull();
    expect(() => forgetPendingPayment()).not.toThrow();
  });
});
