/**
 * Promo codes this browser has already spent.
 *
 * The welcome code is advertised as one-time ("ერთჯერადი"), but nothing stopped a shopper
 * typing it again on their next order — EchoDesk validates the code itself, not who is asking.
 * A code is recorded here once an order carrying it has been paid, and the cart then refuses
 * it with the "already used" message instead of promising a discount checkout won't honour.
 *
 * Per browser, so it isn't a security control — the backend remains the authority on what a
 * code is worth. It is what keeps the promise the popup makes.
 */
const KEY = "nitchiani:coupons:used:v1";

function read(): string[] {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(parsed) ? parsed.filter((c): c is string => typeof c === "string") : [];
  } catch {
    return [];
  }
}

/** Codes are compared case-insensitively: "welcome10" and "WELCOME10" are one code. */
export function isCouponUsed(code: string): boolean {
  const wanted = code.trim().toUpperCase();
  return wanted.length > 0 && read().includes(wanted);
}

export function markCouponUsed(code: string | null | undefined): void {
  const value = code?.trim().toUpperCase();
  if (!value) return;
  try {
    const used = read();
    if (!used.includes(value)) localStorage.setItem(KEY, JSON.stringify([...used, value]));
  } catch {
    // Storage unavailable: the code simply isn't remembered.
  }
}
