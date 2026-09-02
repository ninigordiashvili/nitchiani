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
