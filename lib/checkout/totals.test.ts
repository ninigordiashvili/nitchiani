import { describe, expect, it } from "vitest";
import { computeTotals, type TotalsLine } from "./totals";

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
    expect(res).toEqual({ ok: false, error: "Invalid subtotal" });
  });

  it("rejects a non-numeric unit price (NaN subtotal)", () => {
    const res = computeTotals([line("not-a-number", 1)], null);
    expect(res).toEqual({ ok: false, error: "Invalid subtotal" });
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
    expect(res).toEqual({ ok: false, error: "Coupon code is not valid." });
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
