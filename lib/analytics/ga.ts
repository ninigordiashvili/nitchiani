import { hasAnalyticsConsent } from "@/lib/ui/cookie-consent";

/**
 * Google Analytics 4 event helper.
 *
 * Every call re-reads the visitor's stored cookie decision, so a rejected or unanswered banner
 * means nothing is sent and nothing is queued — not even for later. Events carry product and
 * order facts only (ids, names, prices, quantities); never a name, phone, e-mail, address or
 * promo code, since a code gifted to one person identifies them.
 */
export const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export type GaItem = {
  item_id: string;
  item_name: string;
  item_variant?: string;
  item_category?: string;
  price?: number;
  quantity?: number;
};

/**
 * Defines `gtag` as the standard queue and configures the property, once. The gtag.js file
 * (loaded by <Analytics/> only after consent) drains the queue when it arrives, so an event
 * sent a moment after "Accept all" is not lost.
 */
export function ensureGtag(): boolean {
  if (typeof window === "undefined" || !GA_ID) return false;
  if (typeof window.gtag !== "function") {
    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag() {
      // gtag.js only understands the `arguments` object, not an array.
      // eslint-disable-next-line prefer-rest-params
      window.dataLayer!.push(arguments);
    };
    window.gtag("js", new Date());
    // <Analytics/> sends page_view itself on every navigation, so GA's automatic one would
    // double-count the landing page.
    window.gtag("config", GA_ID, { send_page_view: false, anonymize_ip: true });
  }
  return true;
}

/** Sends one GA4 event. Returns whether it was actually handed to GA. */
export function trackEvent(name: string, params: Record<string, unknown> = {}): boolean {
  if (!hasAnalyticsConsent() || !ensureGtag()) return false;
  window.gtag!("event", name, params);
  return true;
}

export const CURRENCY = "GEL";
