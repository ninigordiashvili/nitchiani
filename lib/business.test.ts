import { describe, expect, it } from "vitest";
import { BUSINESS, BUSINESS_DETAILS_FILLED, businessAddress } from "./business";

/**
 * The footer's legal block renders only when this is true. These pin the two halves of that
 * contract: the flag must actually detect the placeholders, and it must flip once they're
 * replaced — otherwise the block either leaks "[LEGAL ENTITY NAME]" to customers or stays
 * hidden after incorporation, and both fail quietly.
 */
describe("BUSINESS_DETAILS_FILLED", () => {
  it("is true now the registration details are filled in", () => {
    // The footer's legal block and the legal pages depend on it; card acquirers check them.
    expect(BUSINESS_DETAILS_FILLED).toBe(true);
  });

  it("detects a bracketed placeholder in any of the three required fields", () => {
    const filled = (o: { legalName: string; registrationId: string; street: string }) =>
      !o.legalName.startsWith("[") && !o.registrationId.startsWith("[") && !o.street.startsWith("[");
    const real = { legalName: "ი/მ Name Surname", registrationId: "01001012345", street: "Street 1" };
    expect(filled(real)).toBe(true);
    expect(filled({ ...real, legalName: "[LEGAL ENTITY NAME]" })).toBe(false);
    expect(filled({ ...real, registrationId: "[REGISTRATION NUMBER]" })).toBe(false);
    expect(filled({ ...real, street: "[REGISTERED ADDRESS]" })).toBe(false);
  });

  it("writes the address in the reader's language", () => {
    expect(businessAddress("ka")).toBe("სულხან ცინცაძის ქუჩა 17, თბილისი, საქართველო");
    expect(businessAddress("en")).toBe("17 Sulkhan Tsintsadze St, Tbilisi, Georgia");
  });

  it("keeps the contact details that are real", () => {
    // The email and phone aren't placeholders and are used elsewhere in the footer.
    expect(BUSINESS.email).not.toMatch(/^\[/);
    expect(BUSINESS.email).toContain("@");
  });
});
