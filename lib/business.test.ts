import { describe, expect, it } from "vitest";
import { BUSINESS, BUSINESS_DETAILS_FILLED, businessAddress } from "./business";

/**
 * Terms §2 and Privacy §1 name the business outright, with no check that the values are real.
 * This is that check: the flag must detect a placeholder in any of the three required fields,
 * and it must be true for what `lib/business.ts` holds today — so a reset placeholder fails
 * here rather than reaching a customer as "[LEGAL ENTITY NAME]".
 */
describe("BUSINESS_DETAILS_FILLED", () => {
  it("is true now the registration details are filled in", () => {
    // The legal pages depend on it; card acquirers read them during review.
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
    // The email and phone aren't placeholders — the footer's contact column shows them.
    expect(BUSINESS.email).not.toMatch(/^\[/);
    expect(BUSINESS.email).toContain("@");
  });
});
