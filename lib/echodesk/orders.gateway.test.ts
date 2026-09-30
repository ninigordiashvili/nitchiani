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

/** The JSON actually posted to guest-checkout. */
const sentBody = () => JSON.parse(fetchMock.mock.calls[0][1].body);

const withCourier = (): ManualOrderInput => ({
  ...input(),
  paymentMethod: "cod",
  lat: 41.7151,
  lng: 44.8271,
  courierName: "Georgian Post",
  courierId: 16,
  courierFeeId: "57",
  courierPrice: 8.01,
});

describe("the courier choice travels as structured fields", () => {
  it("sends the provider, tier, name and price", async () => {
    // These are what EchoDesk books the parcel from. Before the backend added them the
    // choice went into the order notes and somebody re-entered it by hand.
    const { createGuestOrder } = await load();
    fetchMock.mockResolvedValue(ok({ id: 1 }));
    await createGuestOrder(withCourier());
    expect(sentBody()).toMatchObject({
      quickshipper_provider_id: 16,
      quickshipper_provider_fee_id: "57",
      quickshipper_provider_name: "Georgian Post",
    });
  });

  it("sends the price as a two-place decimal string", async () => {
    // `format: decimal`, pattern ^-?\d{0,8}(\.\d{0,2})?$ — a float from the quote maths can
    // arrive as 8.010000000000001, which the backend rejects outright.
    const { createGuestOrder } = await load();
    fetchMock.mockResolvedValue(ok({ id: 1 }));
    await createGuestOrder({ ...withCourier(), courierPrice: 8.010000000000001 });
    expect(sentBody().quickshipper_price).toBe("8.01");
  });

  it("keeps the fee id a string, since not every tier is numeric", async () => {
    // Go Delivery quotes its tiers as "Bike" and "Car", Glovo as "ASAP".
    const { createGuestOrder } = await load();
    fetchMock.mockResolvedValue(ok({ id: 1 }));
    await createGuestOrder({ ...withCourier(), courierId: 22, courierFeeId: "Bike" });
    expect(sentBody().quickshipper_provider_fee_id).toBe("Bike");
  });

  it("sends nothing at all when the tier is unknown", async () => {
    // A provider without its fee id lets EchoDesk pick the tier — and one provider is quoted
    // at several speeds and prices, so it could pick a cheaper one than the shopper paid for.
    const { createGuestOrder } = await load();
    fetchMock.mockResolvedValue(ok({ id: 1 }));
    await createGuestOrder({ ...withCourier(), courierFeeId: undefined });
    expect(sentBody()).not.toHaveProperty("quickshipper_provider_id");
    expect(sentBody()).not.toHaveProperty("quickshipper_price");
  });

  it("omits parcel dimensions rather than inventing them", async () => {
    const { createGuestOrder } = await load();
    fetchMock.mockResolvedValue(ok({ id: 1 }));
    await createGuestOrder(withCourier());
    expect(sentBody()).not.toHaveProperty("quickshipper_parcel_dimensions_id");
  });
});

describe("the map pin travels as coordinates", () => {
  it("puts latitude and longitude on the address", async () => {
    const { createGuestOrder } = await load();
    fetchMock.mockResolvedValue(ok({ id: 1 }));
    await createGuestOrder(withCourier());
    expect(sentBody().address).toMatchObject({ latitude: 41.7151, longitude: 44.8271 });
  });

  it("leaves them off a typed-only address", async () => {
    const { createGuestOrder } = await load();
    fetchMock.mockResolvedValue(ok({ id: 1 }));
    await createGuestOrder({ ...withCourier(), lat: undefined, lng: undefined });
    expect(sentBody().address).not.toHaveProperty("latitude");
  });

  it("refuses a zeroed pair rather than dispatching to Null Island", async () => {
    const { createGuestOrder } = await load();
    fetchMock.mockResolvedValue(ok({ id: 1 }));
    await createGuestOrder({ ...withCourier(), lat: 0, lng: 0 });
    expect(sentBody().address).not.toHaveProperty("latitude");
  });
});

describe("collection is a delivery method, not a note", () => {
  it("marks a pickup order", async () => {
    const { createGuestOrder } = await load();
    fetchMock.mockResolvedValue(ok({ id: 1 }));
    await createGuestOrder({ ...withCourier(), pickup: true });
    expect(sentBody().delivery_method).toBe("pickup");
  });

  it("books no courier for one", async () => {
    // Nobody is delivering it, so a provider id on the order is a dispatch waiting to happen.
    const { createGuestOrder } = await load();
    fetchMock.mockResolvedValue(ok({ id: 1 }));
    await createGuestOrder({ ...withCourier(), pickup: true });
    expect(sentBody()).not.toHaveProperty("quickshipper_provider_id");
  });

  it("marks a delivery as courier", async () => {
    const { createGuestOrder } = await load();
    fetchMock.mockResolvedValue(ok({ id: 1 }));
    await createGuestOrder(withCourier());
    expect(sentBody().delivery_method).toBe("courier");
  });
});

describe("notes are the customer's own words", () => {
  it("carries the note and nothing else", async () => {
    const { createGuestOrder } = await load();
    fetchMock.mockResolvedValue(ok({ id: 1 }));
    await createGuestOrder({ ...withCourier(), notes: "Ring twice" });
    expect(sentBody().notes).toBe("Ring twice");
  });

  it("omits notes entirely when there are none", async () => {
    // Rather than posting an empty string, or the pin and courier we used to append here.
    const { createGuestOrder } = await load();
    fetchMock.mockResolvedValue(ok({ id: 1 }));
    await createGuestOrder({ ...withCourier(), notes: "   " });
    expect(sentBody()).not.toHaveProperty("notes");
  });
});

describe("order lines", () => {
  const sent = () => JSON.parse(fetchMock.mock.calls[0][1].body as string) as {
    items: Array<{ product_id: number; variant_id?: number }>;
  };

  it("sends a variant under its parent product, not under its own id", async () => {
    const { createGuestOrder } = await load();
    fetchMock.mockResolvedValue(ok({ id: 1 }));
    const order = input();
    order.lines[0].variantId = "gid://echodesk/Variant/3?product=7";
    await createGuestOrder(order);
    expect(sent().items).toEqual([{ product_id: 7, variant_id: 3, quantity: 1 }]);
  });

  it("refuses a variant whose parent product is unknown", async () => {
    const { createGuestOrder } = await load();
    const order = input();
    order.lines[0].variantId = "gid://echodesk/Variant/3";
    expect(await createGuestOrder(order)).toEqual({ ok: false });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("reports which product the backend no longer sells", async () => {
    const { createGuestOrder } = await load();
    fetchMock.mockResolvedValue({
      ok: false,
      status: 400,
      text: async () => JSON.stringify({ error: "Product with id 1 not found or inactive." }),
    } as unknown as Response);
    expect(await createGuestOrder(input())).toMatchObject({ ok: false, missingProductId: 1 });
  });
});

describe("bank choice", () => {
  const sent = () => JSON.parse(fetchMock.mock.calls[0][1].body as string) as Record<string, unknown>;

  it("sends the chosen bank with a card order", async () => {
    const { createGuestOrder } = await load();
    fetchMock.mockResolvedValue(ok({ id: 1, payment_url: "https://pay.flitt.com/x" }));
    await createGuestOrder({ ...input(), paymentMethod: "tbc_card", paymentProvider: "flitt" });
    expect(sent()).toMatchObject({ payment_method: "card", payment_provider: "flitt" });
  });

  it("leaves it out when none was chosen, so EchoDesk uses the shop default", async () => {
    const { createGuestOrder } = await load();
    fetchMock.mockResolvedValue(ok({ id: 1, payment_url: "https://payment.bog.ge?order_id=a" }));
    await createGuestOrder(input());
    expect(sent()).not.toHaveProperty("payment_provider");
  });

  it("never sends one with cash on delivery", async () => {
    const { createGuestOrder } = await load();
    fetchMock.mockResolvedValue(ok({ id: 1 }));
    await createGuestOrder({ ...input(), paymentMethod: "cod", paymentProvider: "flitt" });
    expect(sent()).not.toHaveProperty("payment_provider");
  });
});
