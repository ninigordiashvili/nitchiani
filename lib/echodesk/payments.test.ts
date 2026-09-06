import { describe, expect, it } from "vitest";
import { paymentAvailability } from "./payments";

describe("paymentAvailability", () => {
  it("reads the tenant's switches", () => {
    expect(
      paymentAvailability({
        payment: {
          enable_card_payment: true,
          enable_cash_on_delivery: false,
          active_providers: ["bog"],
        },
      }),
    ).toEqual({ card: true, cashOnDelivery: false });
  });

  it("matches the tenant as configured today", () => {
    // Card off, cash on, only "cash" live — the opposite of what the env vars said.
    expect(
      paymentAvailability({
        payment: {
          enable_card_payment: false,
          enable_cash_on_delivery: true,
          active_providers: ["cash"],
        },
      }),
    ).toEqual({ card: false, cashOnDelivery: true });
  });

  it("refuses card when the switch is on but no provider is live", () => {
    // A shop can enable cards before the bank issues credentials. Offering it then just
    // moves the failure to the last step of checkout.
    expect(
      paymentAvailability({
        payment: { enable_card_payment: true, active_providers: ["cash"] },
      }).card,
    ).toBe(false);
    expect(
      paymentAvailability({
        payment: { enable_card_payment: true, active_providers: [] },
      }).card,
    ).toBe(false);
  });

  it("offers nothing when the tenant says nothing", () => {
    expect(paymentAvailability(null)).toEqual({ card: false, cashOnDelivery: false });
    expect(paymentAvailability({})).toEqual({ card: false, cashOnDelivery: false });
  });
});
