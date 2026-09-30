import { afterEach, describe, expect, it, vi } from "vitest";

const getOrderByToken = vi.fn();
vi.mock("@/lib/echodesk/orders", () => ({ getOrderByToken }));
vi.mock("@/lib/echodesk/client", () => ({ isEchoDeskConfigured: true, lookupProduct: vi.fn() }));

const { paymentStateAction } = await import("./cart");

afterEach(() => getOrderByToken.mockReset());

describe("paymentStateAction", () => {
  it("reports a paid order, so the bag can empty itself", async () => {
    getOrderByToken.mockResolvedValue({ status: "confirmed", payment_status: "paid" });
    expect(await paymentStateAction("t")).toBe("paid");
  });

  it("reports a failed, cancelled or refunded order as failed", async () => {
    getOrderByToken.mockResolvedValue({ status: "pending", payment_status: "failed" });
    expect(await paymentStateAction("t")).toBe("failed");
    // The shape test order #43 ended up in.
    getOrderByToken.mockResolvedValue({ status: "refunded", payment_status: "failed" });
    expect(await paymentStateAction("t")).toBe("failed");
    getOrderByToken.mockResolvedValue({ status: "cancelled", payment_status: "pending" });
    expect(await paymentStateAction("t")).toBe("failed");
  });

  it("leaves a payment still in progress as pending", async () => {
    getOrderByToken.mockResolvedValue({ status: "pending", payment_status: "pending" });
    expect(await paymentStateAction("t")).toBe("pending");
  });

  it("gives no verdict when the order can't be looked up", async () => {
    getOrderByToken.mockResolvedValue(null);
    expect(await paymentStateAction("t")).toBeNull();
    expect(await paymentStateAction("")).toBeNull();
  });
});
