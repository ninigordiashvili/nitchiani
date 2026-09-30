/**
 * The card order the bag is waiting on.
 *
 * Checkout keeps the bag when it sends the shopper to the bank — the payment can still fail,
 * and an emptied bag would make them build it again. Something has to empty it once the
 * money has moved, and the bank's return trip can't be relied on for that: where it lands is
 * set in EchoDesk, not here. So the bag remembers which order it belongs to, and settles
 * itself when that order turns out to be paid, whichever page the shopper comes back to.
 *
 * Browser storage can be missing or throw (private windows, blocked site data); every access
 * is guarded, and losing the record only means the bag isn't emptied for them.
 */
const KEY = "nitchiani:pending-payment";
/** A bank session doesn't outlive this; an older record is a payment that never finished. */
const MAX_AGE_MS = 24 * 60 * 60 * 1000;

export type PendingPayment = {
  /** EchoDesk's public order token — what the order can be looked up by without an account. */
  token?: string;
  at: number;
};

export function rememberPendingPayment(token: string | undefined): void {
  try {
    localStorage.setItem(KEY, JSON.stringify({ token, at: Date.now() } satisfies PendingPayment));
  } catch {
    // Storage unavailable: the bag simply won't empty itself.
  }
}

export function loadPendingPayment(): PendingPayment | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PendingPayment;
    if (typeof parsed?.at !== "number" || Date.now() - parsed.at > MAX_AGE_MS) {
      localStorage.removeItem(KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function forgetPendingPayment(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // Nothing to do.
  }
}
