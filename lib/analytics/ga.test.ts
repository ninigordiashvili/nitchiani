import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const CONSENT_KEY = "nitchiani:cookie-consent";

function consent(decision: "accepted" | "rejected" | null) {
  if (decision) {
    store.set(CONSENT_KEY, JSON.stringify({ decision, decidedAt: new Date().toISOString() }));
  } else {
    store.delete(CONSENT_KEY);
  }
}

let store: Map<string, string>;
let layer: unknown[];

beforeEach(() => {
  vi.resetModules();
  vi.stubEnv("NEXT_PUBLIC_GA_MEASUREMENT_ID", "G-TEST123");
  store = new Map();
  layer = [];
  const localStorage = {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, v),
    removeItem: (k: string) => void store.delete(k),
  };
  vi.stubGlobal("localStorage", localStorage);
  vi.stubGlobal("window", { dataLayer: layer, localStorage });
});
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

const events = () =>
  layer
    .map((a) => Array.from(a as ArrayLike<unknown>))
    .filter((a) => a[0] === "event")
    .map((a) => ({ name: a[1] as string, params: a[2] as Record<string, unknown> }));

describe("trackEvent", () => {
  it("sends nothing and queues nothing without a decision", async () => {
    const { trackEvent } = await import("./ga");
    expect(trackEvent("view_item")).toBe(false);
    expect(layer).toHaveLength(0);
  });

  it("sends nothing after a rejection", async () => {
    consent("rejected");
    const { trackEvent } = await import("./ga");
    expect(trackEvent("add_to_cart")).toBe(false);
    expect(layer).toHaveLength(0);
  });

  it("sends once accepted, configuring the property first", async () => {
    consent("accepted");
    const { trackEvent } = await import("./ga");
    expect(trackEvent("view_item", { value: 10 })).toBe(true);
    expect(Array.from(layer[0] as ArrayLike<unknown>)[0]).toBe("js");
    expect(events()).toEqual([{ name: "view_item", params: { value: 10 } }]);
  });
});

describe("reportPurchase", () => {
  const snapshot = { value: 55, items: [{ item_id: "a", item_name: "A", price: 55, quantity: 1 }] };

  it("reports an order exactly once", async () => {
    consent("accepted");
    const { rememberOrderSnapshot, reportPurchase } = await import("./purchase");
    rememberOrderSnapshot({ ...snapshot, orderId: "ORD-1" });
    expect(reportPurchase("ORD-1")).toBe(true);
    expect(reportPurchase("ORD-1")).toBe(false);
    const sent = events().filter((e) => e.name === "purchase");
    expect(sent).toHaveLength(1);
    expect(sent[0].params).toMatchObject({ transaction_id: "ORD-1", currency: "GEL", value: 55 });
    // No personal data in what was sent.
    expect(JSON.stringify(sent[0].params)).not.toMatch(/phone|email|address|coupon/i);
  });

  it("does not mark an order as reported when consent is missing, so a later visit can", async () => {
    const { rememberOrderSnapshot, reportPurchase } = await import("./purchase");
    rememberOrderSnapshot({ ...snapshot, orderId: "ORD-2" });
    expect(reportPurchase("ORD-2")).toBe(false);
    consent("accepted");
    expect(reportPurchase("ORD-2")).toBe(true);
  });

  it("reports nothing without a snapshot", async () => {
    consent("accepted");
    const { reportPurchase } = await import("./purchase");
    expect(reportPurchase("ORD-3")).toBe(false);
  });
});
