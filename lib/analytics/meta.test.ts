import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

let store: Map<string, string>;
let win: Record<string, unknown>;

function setup(enabled: boolean, decision: "accepted" | "rejected" | null) {
  vi.resetModules();
  vi.stubEnv("NEXT_PUBLIC_META_PIXEL_ENABLED", enabled ? "true" : "");
  store = new Map();
  if (decision) {
    store.set("nitchiani:cookie-consent", JSON.stringify({ decision, decidedAt: new Date().toISOString(), version: 2 }));
  }
  const localStorage = {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, v),
    removeItem: (k: string) => void store.delete(k),
  };
  win = { localStorage };
  vi.stubGlobal("localStorage", localStorage);
  vi.stubGlobal("window", win);
}
const calls = () =>
  ((win.fbq as { queue: unknown[][] } | undefined)?.queue ?? []).filter((c) => c[0] === "track");

beforeEach(() => vi.unstubAllEnvs());
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

const items = [{ item_id: "wax-1", item_name: "Gel Wax", price: 20, quantity: 2 }];

describe("Meta Pixel", () => {
  it("does nothing while switched off, even with consent", async () => {
    setup(false, "accepted");
    const { trackMeta } = await import("./meta");
    expect(trackMeta("add_to_cart", { value: 40, items })).toBe(false);
    expect(win.fbq).toBeUndefined();
  });

  it("does nothing without consent, or after a rejection", async () => {
    for (const d of [null, "rejected"] as const) {
      setup(true, d);
      const { trackMeta } = await import("./meta");
      expect(trackMeta("view_item", { value: 20, items })).toBe(false);
      expect(win.fbq).toBeUndefined();
    }
  });

  it("sends ids, quantity, value and GEL, and nothing personal", async () => {
    setup(true, "accepted");
    const { trackMeta } = await import("./meta");
    expect(trackMeta("add_to_cart", { value: 40, items, email: "a@b.c" })).toBe(true);
    const [, event, data] = calls()[0] as [string, string, Record<string, unknown>];
    expect(event).toBe("AddToCart");
    expect(data).toMatchObject({
      content_ids: ["wax-1"],
      contents: [{ id: "wax-1", quantity: 2 }],
      value: 40,
      currency: "GEL",
    });
    expect(JSON.stringify(data)).not.toMatch(/@|phone|address/i);
  });

  it("gives a purchase its order id as the event id, and ignores events Meta has no name for", async () => {
    setup(true, "accepted");
    const { trackMeta } = await import("./meta");
    expect(trackMeta("scroll_depth", { scroll_percent: 25 })).toBe(false);
    trackMeta("purchase", { transaction_id: "ORD-1", value: 40, items });
    expect(calls()[0]).toEqual([
      "track",
      "Purchase",
      expect.objectContaining({ value: 40 }),
      { eventID: "ORD-1" },
    ]);
  });
});
