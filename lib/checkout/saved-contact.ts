/**
 * Light persistence of the customer's contact + shipping fields between checkouts. Saved
 * to localStorage AFTER a successful order so the next purchase from the same device
 * pre-fills name / email / phone / address without retyping.
 *
 * What we deliberately do NOT save:
 *   - notes          (per-order, often empty)
 *   - paymentMethod  (every order is its own choice)
 *   - couponCode     (per-order)
 *
 * Privacy posture: data stays on the device. No server-side store, no cross-device sync.
 * Users who want to clear it can do so via their browser's site-data tools, or by calling
 * `clearSavedContact()` from a future "forget my details" affordance.
 */

const STORAGE_KEY = "nitchiani:checkout-contact";

export type SavedContact = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode?: string;
};

function isValid(raw: unknown): raw is SavedContact {
  if (!raw || typeof raw !== "object") return false;
  const r = raw as Record<string, unknown>;
  return (
    typeof r.firstName === "string" &&
    typeof r.lastName === "string" &&
    typeof r.email === "string" &&
    typeof r.phone === "string" &&
    typeof r.address === "string" &&
    typeof r.city === "string" &&
    (r.postalCode === undefined || typeof r.postalCode === "string")
  );
}

export function loadSavedContact(): SavedContact | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    return isValid(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function saveContact(contact: SavedContact): void {
  if (typeof window === "undefined") return;
  try {
    // Only persist the whitelisted fields, even if the caller passes more — defends against
    // accidentally leaking notes/payment-method/coupon if the contact shape ever widens.
    const safe: SavedContact = {
      firstName: contact.firstName,
      lastName: contact.lastName,
      email: contact.email,
      phone: contact.phone,
      address: contact.address,
      city: contact.city,
      postalCode: contact.postalCode,
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(safe));
  } catch {
    // private mode / quota — best-effort
  }
}

export function clearSavedContact(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // best-effort
  }
}
