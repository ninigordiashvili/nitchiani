import { describe, expect, it } from "vitest";
import { BUSINESS, BUSINESS_DETAILS_FILLED } from "./business";

/**
 * The footer's legal block renders only when this is true. These pin the two halves of that
 * contract: the flag must actually detect the placeholders, and it must flip once they're
 * replaced — otherwise the block either leaks "[LEGAL ENTITY NAME]" to customers or stays
 * hidden after incorporation, and both fail quietly.
 */
describe("BUSINESS_DETAILS_FILLED", () => {
  it("is false while the registration details are placeholders", () => {
    // Fails the day someone fills these in — at which point delete this expectation and keep
    // the two below, which are the ones that matter long-term.
    expect(BUSINESS_DETAILS_FILLED).toBe(false);
  });

  it("detects a bracketed placeholder in any of the three required fields", () => {
    const filled = (o: { legalName: string; registrationId: string; address: string }) =>
      !o.legalName.startsWith("[") && !o.registrationId.startsWith("[") && !o.address.startsWith("[");
    const real = { legalName: "Nitchiani LLC", registrationId: "405123456", address: "Tbilisi" };
    expect(filled(real)).toBe(true);
    expect(filled({ ...real, legalName: "[LEGAL ENTITY NAME]" })).toBe(false);
    expect(filled({ ...real, registrationId: "[REGISTRATION NUMBER]" })).toBe(false);
    expect(filled({ ...real, address: "[REGISTERED ADDRESS, Tbilisi, Georgia]" })).toBe(false);
  });

  it("keeps the contact details that are real", () => {
    // The email and phone aren't placeholders and are used elsewhere in the footer.
    expect(BUSINESS.email).not.toMatch(/^\[/);
    expect(BUSINESS.email).toContain("@");
  });
});
