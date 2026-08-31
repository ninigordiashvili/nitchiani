import { describe, expect, it } from "vitest";
import { formatPrice } from "./money";

describe("formatPrice", () => {
  it("formats whole GEL amounts without a fraction", () => {
    expect(formatPrice({ amount: "89", currencyCode: "GEL" }, "en")).toBe("₾89");
    expect(formatPrice({ amount: "89.00", currencyCode: "GEL" }, "en")).toBe("₾89");
  });

  it("keeps two decimals for fractional amounts", () => {
    expect(formatPrice({ amount: "89.50", currencyCode: "GEL" }, "en")).toBe("₾89.50");
  });

  it("uses comma thousands + period decimal for English", () => {
    expect(formatPrice({ amount: "1234.50", currencyCode: "GEL" }, "en")).toBe("₾1,234.50");
  });

  it("returns an em-dash for an unparseable amount", () => {
    expect(formatPrice({ amount: "abc", currencyCode: "GEL" }, "en")).toBe("—");
  });

  it("renders USD with a dollar sign when display currency is USD", () => {
    const out = formatPrice({ amount: "89", currencyCode: "GEL" }, "en", "USD");
    expect(out.startsWith("$")).toBe(true);
  });
});
