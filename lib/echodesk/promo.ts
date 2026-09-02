/**
 * Promo-code validation against EchoDesk — `POST /api/ecommerce/client/promo/validate/`.
 *
 * Unauthenticated, unlike favourites: the code plus a subtotal is all it needs, which is what
 * lets a guest cart price a coupon.
 *
 * EchoDesk is the authority once it's configured. That matters beyond tidiness: the guest
 * checkout applies `promo_code` server-side and charges the total *it* computes, so if we
 * discounted from our own registry the shopper could be shown one price and charged another.
 * One source for the number, and it's the one that takes the money.
 */
const API_URL = process.env.NEXT_PUBLIC_ECHODESK_API_URL?.replace(/\/+$/, "");

export type PromoValidation = {
  valid: boolean;
  /** GEL discount for the subtotal that was quoted. Absent when the code is invalid. */
  discountAmount?: number;
  /** EchoDesk's own explanation — safe to show, it's written for shoppers. */
  message?: string;
};

export async function validatePromo(
  code: string,
  subtotal: number,
): Promise<PromoValidation | null> {
  if (!API_URL) return null;
  const trimmed = code.trim();
  if (!trimmed) return { valid: false };

  const res = await fetch(`${API_URL}/api/ecommerce/client/promo/validate/`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ code: trimmed, subtotal: subtotal.toFixed(2) }),
    cache: "no-store",
  }).catch(() => null);

  // A network failure is not "invalid" — returning null lets the caller refuse the order
  // rather than quietly charging full price on a code that may well be good.
  if (!res || !res.ok) {
    console.error("[echodesk/promo] validate failed:", res?.status);
    return null;
  }

  const json = (await res.json().catch(() => null)) as {
    valid?: boolean;
    discount_amount?: string;
    message?: string;
  } | null;
  if (!json) return null;

  const amount = json.discount_amount ? Number.parseFloat(json.discount_amount) : 0;
  return {
    valid: Boolean(json.valid),
    discountAmount: Number.isFinite(amount) && amount > 0 ? amount : 0,
    message: json.message,
  };
}

/**
 * Why a code was rejected, as a stable key we can translate.
 *
 * EchoDesk explains rejections in English prose ("Promo code not found."). Passing that
 * straight to the page means a Georgian shopper reads an English sentence on an otherwise
 * Georgian site — and prose is also the least stable part of any API. Classifying it into a
 * key lets the storefront say it in the shopper's language, and keeps a wording change on
 * their side from silently becoming a wording change on ours.
 *
 * `unknown` is honest: we show a generic localised line rather than guess, and the raw text
 * is logged so a new case can be added.
 */
export type PromoReason = "notFound" | "minimum" | "expired" | "usageLimit" | "inactive" | "unknown";

const PATTERNS: Array<[PromoReason, RegExp]> = [
  ["minimum", /minimum|min\.?\s*order|at least|subtotal/i],
  ["expired", /expired|no longer valid|out of date/i],
  ["usageLimit", /limit|already used|used up|exhausted|maximum uses/i],
  ["inactive", /inactive|disabled|not active|suspended/i],
  ["notFound", /not found|does ?n[o']?t exist|unknown code|invalid/i],
];

export function classifyPromoMessage(message: string | undefined): PromoReason {
  if (!message) return "unknown";
  for (const [reason, pattern] of PATTERNS) {
    if (pattern.test(message)) return reason;
  }
  console.warn("[echodesk/promo] unrecognised rejection message:", message);
  return "unknown";
}
