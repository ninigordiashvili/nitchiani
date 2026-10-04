import { describe, expect, it } from "vitest";
import { parseTrackingInput } from "./tracking-input";

const TOKEN = "tLUojPQ0SEPl97NN3PdfT9C0_M9DnioMRAccPd4HhMk";

describe("parseTrackingInput", () => {
  it("takes the token out of a pasted tracking link", () => {
    expect(parseTrackingInput(`https://nitchiani.shop/ka/order-status?token=${TOKEN}`)).toEqual({
      kind: "token",
      token: TOKEN,
    });
    expect(parseTrackingInput(`token=${TOKEN}`)).toEqual({ kind: "token", token: TOKEN });
  });

  it("accepts a token pasted on its own", () => {
    expect(parseTrackingInput(` ${TOKEN} `)).toEqual({ kind: "token", token: TOKEN });
  });

  it("recognises an order number, long or short, so the page can explain", () => {
    expect(parseTrackingInput("W1WI7P")).toEqual({ kind: "orderNumber", number: "W1WI7P" });
    expect(parseTrackingInput("#w1wi7p")).toEqual({ kind: "orderNumber", number: "W1WI7P" });
    expect(parseTrackingInput("ORD-20261004-AB12CD")).toEqual({
      kind: "orderNumber",
      number: "ORD-20261004-AB12CD",
    });
  });

  it("says nothing useful about anything else", () => {
    expect(parseTrackingInput("")).toEqual({ kind: "unknown" });
    expect(parseTrackingInput("hello there")).toEqual({ kind: "unknown" });
  });
});
