/**
 * What someone typed into the tracking field.
 *
 * The token is the credential — long and unguessable, which is what lets an order be seen
 * without an account — so it travels as a link people open rather than a code they type.
 * They paste the whole link as often as the token alone, and some type their order number
 * instead, which cannot work: a 6-character code would let anyone read other people's orders.
 * Telling those three apart is what turns a dead "not found" into an answer.
 */
export type TrackingInput =
  | { kind: "token"; token: string }
  | { kind: "orderNumber"; number: string }
  | { kind: "unknown" };

/** `ORD-20261004-AB12CD` or the short code on its own, as the success page shows it. */
const ORDER_NUMBER = /^(?:#\s*)?(?:ORD-\d{8}-)?[A-Z0-9]{6}$/i;

export function parseTrackingInput(raw: string): TrackingInput {
  const value = raw.trim();
  if (!value) return { kind: "unknown" };

  // A pasted link: take the token out of it.
  if (/^https?:\/\//i.test(value) || value.includes("token=")) {
    try {
      const url = new URL(value.startsWith("http") ? value : `https://x/?${value}`);
      const token = url.searchParams.get("token");
      if (token?.trim()) return { kind: "token", token: token.trim() };
    } catch {
      // Not a URL after all; fall through to the checks below.
    }
  }

  if (ORDER_NUMBER.test(value)) return { kind: "orderNumber", number: value.replace(/^#\s*/, "").toUpperCase() };
  // Tokens are long and URL-safe; anything else of that shape is treated as one.
  if (/^[A-Za-z0-9_-]{20,}$/.test(value)) return { kind: "token", token: value };
  return { kind: "unknown" };
}
