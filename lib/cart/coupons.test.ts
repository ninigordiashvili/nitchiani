import { describe, expect, it } from "vitest";
import { couponLabel, discountFor, findCoupon, type Coupon } from "./coupons";

describe("findCoupon", () => {
  it("matches a known code", () => {
    expect(findCoupon("WELCOME10")?.code).toBe("WELCOME10");
  });

  it("is case-insensitive and trims whitespace", () => {
    expect(findCoupon("  welcome10 ")?.code).toBe("WELCOME10");
  });

  it("returns null for an unknown code", () => {
    expect(findCoupon("NOPE")).toBeNull();
  });

  it("returns null for an empty / whitespace code", () => {
    expect(findCoupon("")).toBeNull();
    expect(findCoupon("   ")).toBeNull();
  });
});

describe("discountFor", () => {
  const percent: Coupon = { code: "P", type: "percent", value: 10 };
  const amount: Coupon = { code: "A", type: "amount", value: 20 };

  it("applies a percentage discount", () => {
    expect(discountFor(100, percent)).toBe(10);
  });

  it("applies a flat-amount discount", () => {
    expect(discountFor(100, amount)).toBe(20);
  });

  it("caps a flat-amount discount at the subtotal (never goes negative)", () => {
    expect(discountFor(15, amount)).toBe(15);
  });

  it("returns 0 when the minimum-subtotal gate is not met", () => {
    const gated: Coupon = { code: "G", type: "amount", value: 20, minSubtotal: 100 };
    expect(discountFor(99.99, gated)).toBe(0);
    expect(discountFor(100, gated)).toBe(20);
  });

  it("rounds to 2 decimal places (banker-safe cents)", () => {
    // 33.33 * 10% = 3.333 → 3.33
    expect(discountFor(33.33, percent)).toBe(3.33);
    // 59.97 * 10% = 5.997 → 6.00
    expect(discountFor(59.97, percent)).toBe(6);
  });
});

describe("couponLabel", () => {
  it("formats percent and amount coupons", () => {
    expect(couponLabel({ code: "P", type: "percent", value: 10 })).toBe("−10%");
    expect(couponLabel({ code: "A", type: "amount", value: 20 })).toBe("−₾20");
  });
});
