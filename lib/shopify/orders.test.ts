import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ManualOrderInput } from "./orders";

// The Admin API credentials are read once at module load, so they have to be in place before
// the dynamic import below. Each test gets a fresh module instance via `resetModules`.
process.env.SHOPIFY_STORE_DOMAIN = "test-shop.myshopify.com";
process.env.SHOPIFY_ADMIN_ACCESS_TOKEN = "test-token";

type Orders = typeof import("./orders");

async function loadOrders(): Promise<Orders> {
  vi.resetModules();
  return import("./orders");
}

/** A minimal but realistic card order carrying a coupon. */
function orderInput(overrides: Partial<ManualOrderInput> = {}): ManualOrderInput {
  return {
    firstName: "Nino",
    lastName: "Beridze",
    phone: "+995555123456",
    email: "nino@example.com",
    address: "12 Rustaveli Ave",
    city: "Tbilisi",
    paymentMethod: "bog_card",
    locale: "ka",
    lines: [
      {
        variantId: "gid://shopify/ProductVariant/44556677",
        productHandle: "silk-wrap",
        productTitle: "Silk Wrap",
        variantTitle: "Maroon",
        unitPrice: { amount: "100.00", currencyCode: "GEL" },
        quantity: 1,
      },
    ],
    subtotal: { amount: "100.00", currencyCode: "GEL" },
    discount: { amount: "15.00", currencyCode: "GEL" },
    total: { amount: "85.00", currencyCode: "GEL" },
    couponCode: "WELCOME15",
    ...overrides,
  };
}

function jsonResponse(body: unknown, ok = true) {
  return {
    ok,
    status: ok ? 200 : 422,
    json: async () => body,
    text: async () => JSON.stringify(body),
  } as unknown as Response;
}

let fetchMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
  fetchMock = vi.fn();
  vi.stubGlobal("fetch", fetchMock);
  vi.spyOn(console, "info").mockImplementation(() => {});
  vi.spyOn(console, "warn").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

/** Reads the JSON body handed to the Nth fetch call. */
function bodyOfCall(call: number) {
  return JSON.parse(fetchMock.mock.calls[call][1].body as string);
}

describe("createPendingOrder (card flow)", () => {
  it("attaches the coupon as a Shopify discount code", async () => {
    const { createPendingOrder } = await loadOrders();
    fetchMock.mockResolvedValue(jsonResponse({ order: { id: 991, name: "#1042" } }));

    const result = await createPendingOrder(orderInput());

    expect(result).toEqual({ id: 991, name: "#1042" });
    const { order } = bodyOfCall(0);
    // The gateway charges 85.00 — Shopify has to record the same discount or the order ledger
    // and any later refund are wrong.
    expect(order.discount_codes).toEqual([
      { code: "WELCOME15", amount: "15.00", type: "fixed_amount" },
    ]);
    expect(order.note_attributes).toContainEqual({ name: "coupon_code", value: "WELCOME15" });
    expect(order.note).toContain("Coupon: WELCOME15");
  });

  it("omits discount_codes when no coupon was applied", async () => {
    const { createPendingOrder } = await loadOrders();
    fetchMock.mockResolvedValue(jsonResponse({ order: { id: 992, name: "#1043" } }));

    await createPendingOrder(
      orderInput({ couponCode: undefined, discount: undefined, total: undefined }),
    );

    const { order } = bodyOfCall(0);
    expect(order.discount_codes).toBeUndefined();
    expect(order.note_attributes).not.toContainEqual(
      expect.objectContaining({ name: "coupon_code" }),
    );
  });

  it("builds the same payload as the manual flow", async () => {
    const { createManualOrder, createPendingOrder } = await loadOrders();
    fetchMock.mockResolvedValue(jsonResponse({ order: { id: 993, name: "#1044" } }));

    const input = orderInput({ paymentMethod: "bank_transfer" });
    await createManualOrder(input);
    await createPendingOrder(input);

    expect(bodyOfCall(0)).toEqual(bodyOfCall(1));
  });

  it("refuses to call the Admin API when a variant ID isn't a numeric Shopify GID", async () => {
    const { createPendingOrder } = await loadOrders();
    const input = orderInput();
    input.lines[0].variantId = "dummy-variant";

    expect(await createPendingOrder(input)).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe("markOrderPaid", () => {
  it("records a sale transaction when the order has none", async () => {
    const { markOrderPaid } = await loadOrders();
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ transactions: [] }))
      .mockResolvedValueOnce(jsonResponse({ transaction: { id: 1 } }));

    expect(await markOrderPaid(991, "bog_card")).toBe("marked");
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[1][1].method).toBe("POST");
    expect(bodyOfCall(1).transaction).toMatchObject({ kind: "sale", status: "success" });
  });

  it("does not write a second sale when the order already settled", async () => {
    const { markOrderPaid } = await loadOrders();
    fetchMock.mockResolvedValueOnce(
      jsonResponse({ transactions: [{ kind: "sale", status: "success" }] }),
    );

    // This is the replayed webhook / racing browser-return case.
    expect(await markOrderPaid(991, "bog_card")).toBe("already");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("treats a successful capture as settled too", async () => {
    const { markOrderPaid } = await loadOrders();
    fetchMock.mockResolvedValueOnce(
      jsonResponse({ transactions: [{ kind: "capture", status: "success" }] }),
    );

    expect(await markOrderPaid(991, "tbc_card")).toBe("already");
  });

  it("ignores failed and non-settling transactions", async () => {
    const { markOrderPaid } = await loadOrders();
    fetchMock
      .mockResolvedValueOnce(
        jsonResponse({
          transactions: [
            { kind: "sale", status: "failure" },
            { kind: "authorization", status: "success" },
          ],
        }),
      )
      .mockResolvedValueOnce(jsonResponse({ transaction: { id: 2 } }));

    expect(await markOrderPaid(991, "bog_card")).toBe("marked");
  });

  it("still marks paid when the transaction lookup fails, rather than dropping the payment", async () => {
    const { markOrderPaid } = await loadOrders();
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ errors: "boom" }, false))
      .mockResolvedValueOnce(jsonResponse({ transaction: { id: 3 } }));

    expect(await markOrderPaid(991, "bog_card")).toBe("marked");
  });

  it("reports failure when Shopify rejects the sale transaction", async () => {
    const { markOrderPaid } = await loadOrders();
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ transactions: [] }))
      .mockResolvedValueOnce(jsonResponse({ errors: "nope" }, false));

    expect(await markOrderPaid(991, "bog_card")).toBe("failed");
  });
});
