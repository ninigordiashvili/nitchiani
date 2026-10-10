import { describe, expect, it } from "vitest";
import { trackingUrl } from "./order-confirmation";

const order = (extra: Record<string, unknown>) =>
  ({ locale: "ka", orderId: "ORD-20261011-AB12CD", ...extra }) as never;

describe("the tracking link in the confirmation email", () => {
  it("carries the token, because that is the only thing the page can resolve", () => {
    // EchoDesk publishes no lookup by order number — `orders/by-token/` is the only
    // unauthenticated one — so a link with just the number lands on an explainer.
    const url = trackingUrl(order({ trackingToken: "tok_abc123" }));
    expect(url).toContain("token=tok_abc123");
    expect(url).toContain("order=ORD-20261011-AB12CD");
  });

  it("falls back to the number when the backend issued no token", () => {
    const url = trackingUrl(order({}));
    expect(url).toContain("order=ORD-20261011-AB12CD");
    expect(url).not.toContain("token=");
  });

  it("escapes what it puts in the query", () => {
    expect(trackingUrl(order({ trackingToken: "a b&c" }))).toContain("token=a%20b%26c");
  });
});
