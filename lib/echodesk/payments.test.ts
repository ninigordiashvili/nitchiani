import { describe, expect, it } from "vitest";
import { cardOptions, paymentAvailability, providerForMethod } from "./payments";

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

describe("cardOptions", () => {
  it("offers one option per live bank, TBC through Flitt", () => {
    // The shop today: BOG and Flitt, TBC's gateway.
    expect(cardOptions(["bog", "flitt"]).map((o) => [o.method, o.provider, o.title])).toEqual([
      ["bog_card", "bog", "checkout.bogCard"],
      ["tbc_card", "flitt", "checkout.tbcCard"],
    ]);
  });

  it("falls back to TBC's direct API when Flitt isn't live, and never offers TBC twice", () => {
    expect(cardOptions(["tbc"]).map((o) => o.provider)).toEqual(["tbc"]);
    expect(cardOptions(["flitt", "tbc"]).map((o) => o.provider)).toEqual(["flitt"]);
  });

  it("drops a bank the shop has switched off", () => {
    expect(cardOptions(["bog"]).map((o) => o.method)).toEqual(["bog_card"]);
    expect(cardOptions(["flitt"]).map((o) => o.method)).toEqual(["tbc_card"]);
  });

  it("stays neutral for a provider we have no bank wording for", () => {
    expect(cardOptions(["paddle"])).toEqual([
      { method: "bog_card", title: "checkout.cardGeneric", desc: "checkout.cardGenericDesc" },
    ]);
    expect(cardOptions([])).toEqual([]);
  });
});

describe("providerForMethod", () => {
  it("names the bank to charge for the option picked", () => {
    expect(providerForMethod("bog_card", ["bog", "flitt"])).toEqual({ provider: "bog" });
    expect(providerForMethod("tbc_card", ["bog", "flitt"])).toEqual({ provider: "flitt" });
  });

  it("refuses a bank that isn't live instead of substituting another", () => {
    // A stale page offering TBC must not end up charged through BOG.
    expect(providerForMethod("tbc_card", ["bog"])).toBeNull();
  });
});
