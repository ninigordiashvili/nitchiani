import { CURRENCY, trackEvent, type GaItem } from "./ga";

/**
 * What the success page needs to report a purchase to GA4.
 *
 * The bag is emptied before (cash on delivery) or long before (card, via the bank) the shopper
 * reaches the success page, so the order's value and items are written down at checkout time.
 * Facts only — no contact details, no promo code.
 */
const SNAPSHOT_KEY = "nitchiani:order-snapshot";
const SENT_KEY = "nitchiani:ga-purchases";
const MAX_AGE_MS = 24 * 60 * 60 * 1000;

export type OrderSnapshot = {
  value: number;
  items: GaItem[];
  at: number;
  /** Order number — set for an order placed without a payment step (cash on delivery). */
  orderId?: string;
  /** Public order token — set for a card order, whose payment is confirmed on return. */
  token?: string;
};

export function rememberOrderSnapshot(s: Omit<OrderSnapshot, "at">): void {
  try {
    localStorage.setItem(SNAPSHOT_KEY, JSON.stringify({ ...s, at: Date.now() }));
  } catch {
    // Storage unavailable: that order simply isn't reported.
  }
}

export function loadOrderSnapshot(): OrderSnapshot | null {
  try {
    const raw = localStorage.getItem(SNAPSHOT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as OrderSnapshot;
    if (typeof parsed?.at !== "number" || Date.now() - parsed.at > MAX_AGE_MS) return null;
    return parsed;
  } catch {
    return null;
  }
}

function alreadySent(id: string): boolean {
  try {
    return (JSON.parse(localStorage.getItem(SENT_KEY) ?? "[]") as string[]).includes(id);
  } catch {
    return false;
  }
}

function markSent(id: string): void {
  try {
    const sent = (JSON.parse(localStorage.getItem(SENT_KEY) ?? "[]") as string[]).slice(-49);
    localStorage.setItem(SENT_KEY, JSON.stringify([...sent, id]));
  } catch {
    // Best effort; GA4 also drops a repeated transaction_id.
  }
}

/**
 * Sends `purchase` for a confirmed order — at most once per order id on this browser, and
 * only when GA actually received it (no consent → nothing sent, nothing marked, so a later
 * accepted visit to the same link can still report it).
 */
export function reportPurchase(transactionId: string): boolean {
  if (!transactionId || alreadySent(transactionId)) return false;
  const snap = loadOrderSnapshot();
  if (!snap || snap.items.length === 0) return false;
  const sent = trackEvent("purchase", {
    transaction_id: transactionId,
    currency: CURRENCY,
    value: snap.value,
    items: snap.items,
  });
  if (sent) markSent(transactionId);
  return sent;
}
