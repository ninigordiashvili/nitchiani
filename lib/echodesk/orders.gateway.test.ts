import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ManualOrderInput } from "../shopify/orders";

const API = "https://nitchiani.api.echodesk.ge";
async function load() {
  vi.resetModules();
  vi.stubEnv("NEXT_PUBLIC_ECHODESK_API_URL", API);
  return import("./orders");
}

const input = (): ManualOrderInput => ({
  firstName: "Nino",
  lastName: "Beridze",
  phone: "555123456",
  email: "n@example.com",
  address: "12 Rustaveli",
  city: "Tbilisi",
  paymentMethod: "bog_card",
  locale: "ka",
  lines: [
    {
      variantId: "gid://echodesk/Product/1",
      productHandle: "prod-001",
      productTitle: "T",
      variantTitle: "One Size",
      unitPrice: { amount: "10.00", currencyCode: "GEL" },
      quantity: 1,
    },
  ],
  subtotal: { amount: "10.00", currencyCode: "GEL" },
});

let fetchMock: ReturnType<typeof vi.fn>;
beforeEach(() => {
  fetchMock = vi.fn();
  vi.stubGlobal("fetch", fetchMock);
  vi.spyOn(console, "error").mockImplementation(() => {});
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

const ok = (body: unknown) =>
  ({ ok: true, status: 200, json: async () => body, text: async () => "" }) as unknown as Response;

/**
 * EchoDesk picks the card gateway; the storefront only follows `payment_url`. These pin that
 * the switch from BOG to TBC needs no code change here — the day the tenant is reconfigured,
 * the shopper is sent to TBC instead, with nothing to redeploy.
 */
describe("card gateway is whatever EchoDesk returns", () => {
  it("follows a BOG payment url", async () => {
    const { createGuestOrder } = await load();
    fetchMock.mockResolvedValue(
      ok({ id: 1, public_token: "t", payment_url: "https://payment.bog.ge?order_id=abc" }),
    );
    const out = await createGuestOrder(input());
    expect(out).toMatchObject({ ok: true });
    expect(out.ok && out.order.paymentUrl).toBe("https://payment.bog.ge?order_id=abc");
  });

  it("follows a TBC payment url with no code change", async () => {
    const { createGuestOrder } = await load();
    fetchMock.mockResolvedValue(
      ok({ id: 2, public_token: "t", payment_url: "https://ecom.tbcbank.ge/pay/xyz" }),
    );
    const out = await createGuestOrder(input());
    expect(out.ok && out.order.paymentUrl).toBe("https://ecom.tbcbank.ge/pay/xyz");
  });

  it("treats an order with no payment_url as already placed", async () => {
    // Cash on delivery / pickup: nothing to redirect to, so the caller confirms immediately.
    const { createGuestOrder } = await load();
    fetchMock.mockResolvedValue(ok({ id: 3, public_token: "t", order_number: "ORD-1" }));
    const out = await createGuestOrder(input());
    expect(out.ok && out.order.paymentUrl).toBeUndefined();
    expect(out.ok && out.order.orderNumber).toBe("ORD-1");
  });

  it("sends the same `card` method whichever gateway is live behind it", async () => {
    const { createGuestOrder } = await load();
    fetchMock.mockResolvedValue(ok({ id: 4, payment_url: "https://ecom.tbcbank.ge/pay/xyz" }));
    await createGuestOrder({ ...input(), paymentMethod: "tbc_card" });
    expect(JSON.parse(fetchMock.mock.calls[0][1].body).payment_method).toBe("card");
  });
});
