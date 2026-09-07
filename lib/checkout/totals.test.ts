import { describe, expect, it } from "vitest";
import { computeTotals, withShipping, type TotalsLine } from "./totals";

const line = (amount: string, quantity = 1): TotalsLine => ({
  unitPrice: { amount },
  quantity,
});

describe("computeTotals", () => {
  it("sums line items into the subtotal", () => {
    const res = computeTotals([line("50.00", 2), line("19.99", 1)], null);
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    expect(res.totals.subtotal).toBeCloseTo(119.99, 2);
    expect(res.totals.discount).toBe(0);
    expect(res.totals.total).toBeCloseTo(119.99, 2);
    expect(res.totals.coupon).toBeNull();
  });

  it("rejects a non-positive subtotal", () => {
    const res = computeTotals([line("0", 1)], null);
    expect(res).toEqual({ ok: false, error: "invalidSubtotal" });
  });

  it("rejects a non-numeric unit price (NaN subtotal)", () => {
    const res = computeTotals([line("not-a-number", 1)], null);
    expect(res).toEqual({ ok: false, error: "invalidSubtotal" });
  });

  it("applies a valid percentage coupon and attaches it", () => {
    const res = computeTotals([line("100.00", 1)], "WELCOME10");
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    expect(res.totals.discount).toBe(10);
    expect(res.totals.total).toBe(90);
    expect(res.totals.coupon?.code).toBe("WELCOME10");
  });

  it("rejects an unknown coupon code", () => {
    const res = computeTotals([line("100.00", 1)], "DOES-NOT-EXIST");
    expect(res).toEqual({ ok: false, error: "promoInvalid" });
  });

  it("keeps the coupon attached but charges full price when the min-subtotal gate fails", () => {
    // GEORGIA20 requires a 100 GEL minimum.
    const res = computeTotals([line("50.00", 1)], "GEORGIA20");
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    expect(res.totals.discount).toBe(0);
    expect(res.totals.total).toBe(50);
    expect(res.totals.coupon?.code).toBe("GEORGIA20"); // attached for analytics
  });

  it("rounds the discounted total to 2 decimals", () => {
    // 19.99 * 3 = 59.97 ; WELCOME10 → 6.00 off ; total 53.97
    const res = computeTotals([line("19.99", 3)], "WELCOME10");
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    expect(res.totals.total).toBe(53.97);
  });
});

describe("bundle offers", () => {
  const pack = (quantity: number) => ({
    productHandle: "prod-002",
    unitPrice: { amount: "80.00" },
    quantity,
  });

  it("discounts a bag that meets the pack count", () => {
    const out = computeTotals([pack(3)], "ARIEL15");
    expect(out.ok && out.totals.discount).toBe(15);
    expect(out.ok && out.totals.total).toBe(225);
  });

  it("withdraws the discount once a pack is removed", () => {
    // The reported bug: 3 packs qualify, one is removed, ₾15 stayed off.
    const out = computeTotals([pack(2)], "ARIEL15");
    expect(out.ok && out.totals.discount).toBe(0);
    expect(out.ok && out.totals.total).toBe(160);
  });

  it("keeps the coupon attached so restoring the pack restores the discount", () => {
    const out = computeTotals([pack(2)], "ARIEL15");
    expect(out.ok && out.totals.coupon?.code).toBe("ARIEL15");
  });

  it("counts both listings the offer accepts", () => {
    const out = computeTotals(
      [pack(2), { productHandle: "a", unitPrice: { amount: "80.00" }, quantity: 1 }],
      "ARIEL15",
    );
    expect(out.ok && out.totals.discount).toBe(15);
  });

  it("does not discount an unrelated bag that merely reaches the old spend threshold", () => {
    // ₾240 of something else used to satisfy the minimum-subtotal proxy.
    const out = computeTotals(
      [{ productHandle: "prod-001", unitPrice: { amount: "240.00" }, quantity: 1 }],
      "ARIEL15",
    );
    expect(out.ok && out.totals.discount).toBe(0);
  });

  it("leaves codes without a pack condition alone", () => {
    const out = computeTotals(
      [{ productHandle: "prod-001", unitPrice: { amount: "100.00" }, quantity: 1 }],
      "GEORGIA20",
    );
    expect(out.ok && out.totals.discount).toBe(20);
  });
});

describe("withShipping", () => {
  const base = {
    subtotal: 100,
    discount: 10,
    shipping: 0,
    total: 90,
    coupon: null,
    shippingMethodId: null,
  };
  const address = { street: "ჭავჭავაძის 28", city: "თბილისი" };
  const lines = [{ productHandle: "3", unitPrice: { amount: "100.00" }, quantity: 1 }];

  it("charges nothing when no backend is configured", async () => {
    // Tests run without NEXT_PUBLIC_ECHODESK_API_URL, so nothing can be looked up and the
    // shop is treated as charging no delivery — not as "we couldn't work it out".
    const out = await withShipping(base, "ka", address, lines);
    expect(out.reason).toBeNull();
    expect(out.totals?.shipping).toBe(0);
    expect(out.totals?.total).toBe(90);
  });

  it("leaves the goods figures untouched", async () => {
    const out = await withShipping(base, "ka", address, lines);
    expect(out.totals?.subtotal).toBe(100);
    expect(out.totals?.discount).toBe(10);
  });
});
