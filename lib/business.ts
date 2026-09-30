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
  /**
   * Name as registered with the Public Registry. A sole proprietor (ინდივიდუალური მეწარმე),
   * not a company — hence "ი/მ", and "IE" (individual entrepreneur) in English.
   */
  legalName: { ka: "ი/მ ნინი გორდიაშვილი", en: "IE Nini Gordiashvili" },
  /** Identification code. For a sole proprietor this is the 11-digit personal number. */
  registrationId: "01024088873",
  /** Optional — only if you're VAT-registered. */
  vatId: undefined as string | undefined,
  /**
   * Registered address — street and number, per language. The city and country are added by
   * `businessAddress`, so they can't disagree between the two languages.
   */
  street: { ka: "სულხან ცინცაძის ქუჩა 17", en: "17 Sulkhan Tsintsadze St" },
  /** Public-facing contact email. */
  email: "Info@nitchiani.shop",
  /** Numeric page id. Kept separate from the URL because Messenger links (`m.me/<id>`) need
   *  the id on its own — see lib/contact-channels.ts. */
  facebookPageId: "61593930928320",
  /** Official Facebook page. Numeric profile URL — the page has no vanity handle yet. */
  facebookUrl: "https://www.facebook.com/profile.php?id=61593930928320",
  /** Display name for the Facebook page (the URL carries no readable handle). */
  facebookName: "Nitchiani Shop",
} as const;

/** Convenience boolean — true once the placeholders have been replaced with real data. */
export const BUSINESS_DETAILS_FILLED =
  !BUSINESS.legalName.ka.startsWith("[") &&
  !BUSINESS.registrationId.startsWith("[") &&
  !BUSINESS.street.ka.startsWith("[");

/** The full registered address, in the reader's language. */
export function businessAddress(locale: string): string {
  return locale === "ka"
    ? `${BUSINESS.street.ka}, თბილისი, საქართველო`
    : `${BUSINESS.street.en}, Tbilisi, Georgia`;
}
