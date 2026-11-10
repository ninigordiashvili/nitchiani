import { afterEach, describe, expect, it, vi } from "vitest";
import type { ManualOrderInput } from "../shopify/orders";
import { buildBotPayload, notifyBot } from "./notify-bot";

const input = {
  paymentMethod: "bog_card",
  pickup: false,
  lines: [{ variantId: "gid://echodesk/Variant/11?product=4", productHandle: "h", productTitle: "Ariel", variantTitle: "1B", quantity: 2, unitPrice: { amount: "70.00", currencyCode: "GEL" } }],
  subtotal: { amount: "140.00", currencyCode: "GEL" },
  discount: { amount: "14.00", currencyCode: "GEL" },
  shipping: { amount: "8.01", currencyCode: "GEL" },
  total: { amount: "134.01", currencyCode: "GEL" },
  firstName: "A", lastName: "B", phone: "1", email: "a@b.c", address: "x", city: "y", locale: "ka",
} as unknown as ManualOrderInput;

afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); });

describe("buildBotPayload", () => {
  it("keys lines by EchoDesk id and carries prices, never contact details", () => {
    const p = buildBotPayload(input);
    expect(p.lines).toEqual([{ key: "variant:11", title: "Ariel", variantTitle: "1B", qty: 2, unitPrice: 70 }]);
    expect(p).toMatchObject({ subtotal: 140, discount: 14, shipping: 8.01, total: 134.01, paymentMethod: "card" });
    expect(JSON.stringify(p)).not.toMatch(/a@b\.c|phone/);
  });
  it("maps cash on delivery and defaults missing amounts to 0", () => {
    const p = buildBotPayload({ ...input, paymentMethod: "cod", discount: undefined, shipping: undefined } as ManualOrderInput);
    expect(p.paymentMethod).toBe("cod");
    expect(p.discount).toBe(0);
    expect(p.shipping).toBe(0);
  });
});

describe("notifyBot", () => {
  it("does nothing, and does not even call fetch, when unconfigured", async () => {
    const f = vi.fn(); vi.stubGlobal("fetch", f);
    await notifyBot({ orderNumber: "ORD-1", token: "t" }, input);
    expect(f).not.toHaveBeenCalled();
  });
  it("does nothing when the order has no tracking token", async () => {
    vi.stubEnv("BOT_INGEST_URL", "https://bot/ingest"); vi.stubEnv("BOT_INGEST_SECRET", "s");
    const f = vi.fn(); vi.stubGlobal("fetch", f);
    await notifyBot({ orderNumber: "ORD-1", token: undefined }, input);
    expect(f).not.toHaveBeenCalled();
  });
  it("posts with the bearer secret", async () => {
    vi.stubEnv("BOT_INGEST_URL", "https://bot/ingest"); vi.stubEnv("BOT_INGEST_SECRET", "s3cret");
    const f = vi.fn().mockResolvedValue({ ok: true, status: 200 }); vi.stubGlobal("fetch", f);
    await notifyBot({ orderNumber: "ORD-1", token: "tok" }, input);
    const [url, init] = f.mock.calls[0];
    expect(url).toBe("https://bot/ingest");
    expect(init.headers.Authorization).toBe("Bearer s3cret");
    expect(JSON.parse(init.body)).toMatchObject({ orderNumber: "ORD-1", token: "tok" });
  });
  it("throws on a non-2xx so the caller can report it", async () => {
    vi.stubEnv("BOT_INGEST_URL", "https://bot/ingest"); vi.stubEnv("BOT_INGEST_SECRET", "s");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 500 }));
    await expect(notifyBot({ orderNumber: "ORD-1", token: "t" }, input)).rejects.toThrow("500");
  });
});
