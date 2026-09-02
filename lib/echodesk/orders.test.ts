import { describe, expect, it } from "vitest";
import { toEchoDeskPaymentMethod } from "./orders";

describe("toEchoDeskPaymentMethod", () => {
  it("collapses both card gateways to EchoDesk's single card method", () => {
    expect(toEchoDeskPaymentMethod("bog_card")).toBe("card");
    expect(toEchoDeskPaymentMethod("tbc_card")).toBe("card");
  });

  it("maps cash on delivery", () => {
    expect(toEchoDeskPaymentMethod("cod")).toBe("cash_on_delivery");
  });

  it("refuses bank transfer rather than substituting a card charge", () => {
    // Folding this into "card" would take payment the customer never agreed to.
    expect(toEchoDeskPaymentMethod("bank_transfer")).toBeNull();
  });
});
