/**
 * Single source of truth for the legal/business identity that appears in the footer
 * and in the legal pages (Terms §2, Privacy §1). Replace the placeholders below
 * with your real registration details before going live — every customer-facing
 * disclosure pulls from this object.
 *
 * Why a code constant instead of env vars: these values rarely change, they're
 * the same across dev/staging/prod, and inlining them into the bundle keeps the
 * legal copy intact even if the env file is missing.
 */
export const BUSINESS = {
  /** Legal entity name as registered with the Public Service Hall of Georgia. */
  legalName: "[LEGAL ENTITY NAME]",
  /** 9- or 11-digit identification number from your registration certificate. */
  registrationId: "[REGISTRATION NUMBER]",
  /** Optional — only if you're VAT-registered. */
  vatId: undefined as string | undefined,
  /** Registered legal address (street, city, country). */
  address: "[REGISTERED ADDRESS, Tbilisi, Georgia]",
  /** Public-facing contact email. */
  email: "hello@nitchiani.com",
} as const;

/** Convenience boolean — true once the placeholders have been replaced with real data. */
export const BUSINESS_DETAILS_FILLED =
  !BUSINESS.legalName.startsWith("[") &&
  !BUSINESS.registrationId.startsWith("[") &&
  !BUSINESS.address.startsWith("[");
