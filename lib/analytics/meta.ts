import { hasAnalyticsConsent } from "@/lib/ui/cookie-consent";

/**
 * Meta Pixel, mirrored from the GA4 events so each action is defined in one place.
 *
 * Two gates, both required:
 *  - `NEXT_PUBLIC_META_PIXEL_ENABLED=true` — the pixel is OFF by default. It is switched on only
 *    once the cookie banner and the privacy policy name Meta; today they name Google Analytics
 *    alone, so "Accept all" does not yet cover sending visits to Meta.
 *  - the stored cookie decision is "accepted", re-read on every call.
 *
 * Only product ids, quantities, value and currency are sent — never a name, phone, e-mail or
 * address. The pixel is not given advanced matching.
 */
export const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID || "1716505300206095";
export const META_ENABLED = process.env.NEXT_PUBLIC_META_PIXEL_ENABLED === "true";

type Fbq = ((...args: unknown[]) => void) & {
  callMethod?: (...args: unknown[]) => void;
  queue: unknown[];
  loaded: boolean;
  version: string;
  push: unknown;
};

declare global {
  interface Window {
    fbq?: Fbq;
    _fbq?: Fbq;
  }
}

/** Meta's standard queue stub, minus the script tag (<MetaPixel/> loads that after consent). */
export function ensureFbq(): boolean {
  if (typeof window === "undefined" || !META_ENABLED) return false;
  if (!window.fbq) {
    const n = function (...args: unknown[]) {
      if (n.callMethod) n.callMethod(...args);
      else n.queue.push(args);
    } as Fbq;
    n.push = n;
    n.loaded = true;
    n.version = "2.0";
    n.queue = [];
    window.fbq = n;
    window._fbq = n;
    window.fbq("init", META_PIXEL_ID);
  }
  return true;
}

type GaLikeItem = { item_id: string; quantity?: number };

const EVENT_MAP: Record<string, string> = {
  view_item: "ViewContent",
  add_to_cart: "AddToCart",
  begin_checkout: "InitiateCheckout",
  purchase: "Purchase",
};

/** The Meta payload for a GA4-shaped event, or null when Meta has no counterpart. */
export function toMeta(
  name: string,
  params: Record<string, unknown>,
): { event: string; data: Record<string, unknown>; eventID?: string } | null {
  const event = EVENT_MAP[name];
  if (!event) return null;
  const items = (params.items as GaLikeItem[] | undefined) ?? [];
  return {
    event,
    data: {
      content_type: "product",
      content_ids: items.map((i) => i.item_id),
      contents: items.map((i) => ({ id: i.item_id, quantity: i.quantity ?? 1 })),
      num_items: items.reduce((n, i) => n + (i.quantity ?? 1), 0),
      value: params.value,
      currency: "GEL",
    },
    // Meta drops a repeated Purchase carrying the same event id.
    ...(name === "purchase" && params.transaction_id
      ? { eventID: String(params.transaction_id) }
      : {}),
  };
}

/** Sends the Meta counterpart of a GA4 event. Returns whether it was handed to Meta. */
export function trackMeta(name: string, params: Record<string, unknown>): boolean {
  if (!META_ENABLED || !hasAnalyticsConsent()) return false;
  const mapped = toMeta(name, params);
  if (!mapped || !ensureFbq()) return false;
  if (mapped.eventID) window.fbq!("track", mapped.event, mapped.data, { eventID: mapped.eventID });
  else window.fbq!("track", mapped.event, mapped.data);
  return true;
}
