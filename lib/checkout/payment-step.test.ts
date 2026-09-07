import { describe, expect, it } from "vitest";
import { paymentStep } from "./payment-step";

describe("paymentStep", () => {
  it("sends a card order to the gateway", () => {
    expect(paymentStep("bog_card", "https://payment.bog.ge/xyz")).toEqual({
      kind: "redirect",
      url: "https://payment.bog.ge/xyz",
    });
    expect(paymentStep("tbc_card", "https://tbc/x").kind).toBe("redirect");
  });

  it("fails a card order with no gateway url", () => {
    // The reported bug: this used to show a success page for an unpaid order.
    expect(paymentStep("bog_card", undefined)).toEqual({ kind: "failed" });
    expect(paymentStep("bog_card", "")).toEqual({ kind: "failed" });
    expect(paymentStep("bog_card", "   ")).toEqual({ kind: "failed" });
  });

  it("completes cash on delivery, which has no gateway by nature", () => {
    expect(paymentStep("cod", undefined)).toEqual({ kind: "complete" });
  });

  it("ignores a url on a method that doesn't use one", () => {
    // Nothing was charged online, so the shopper must not be sent to a payment page.
    expect(paymentStep("cod", "https://payment.bog.ge/xyz")).toEqual({ kind: "complete" });
  });
});
