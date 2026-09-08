import { describe, expect, it } from "vitest";
import { cardLabelKeys, paymentAvailability } from "./payments";

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
    ).toEqual({ card: true, cashOnDelivery: false, providers: ["bog"] });
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
    ).toEqual({ card: false, cashOnDelivery: true, providers: [] });
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
    expect(paymentAvailability(null)).toEqual({ card: false, cashOnDelivery: false, providers: [] });
    expect(paymentAvailability({})).toEqual({ card: false, cashOnDelivery: false, providers: [] });
  });
});

describe("cardLabelKeys", () => {
  it("names the bank when exactly one is live", () => {
    // What the shop wants today: the option says BOG because BOG is what they'll land on.
    expect(cardLabelKeys(["bog"]).title).toBe("checkout.bogCard");
    expect(cardLabelKeys(["tbc"]).title).toBe("checkout.tbcCard");
  });

  it("stays neutral when several are live", () => {
    // Naming one of two would be wrong half the time.
    expect(cardLabelKeys(["bog", "tbc"]).title).toBe("checkout.cardGeneric");
  });

  it("stays neutral for a provider we have no wording for", () => {
    expect(cardLabelKeys(["flitt"]).title).toBe("checkout.cardGeneric");
    expect(cardLabelKeys([]).title).toBe("checkout.cardGeneric");
  });
});
