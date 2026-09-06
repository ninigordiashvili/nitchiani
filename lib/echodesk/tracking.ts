import type { Locale } from "../i18n/config";
import type { OrderTracking } from "../shopify/orders";
import { getOrderByToken } from "./orders";
import { pick } from "./adapt";

/**
 * Public order tracking, keyed by the order's `public_token`.
 *
 * The token is the credential — 43 characters of base64url, unguessable, issued at checkout
 * and delivered to the customer by email. That's what makes tracking work without accounts.
 *
 * It does mean anyone holding the link sees the order, so this maps only what a tracking page
 * needs: status, timestamps, courier and item titles. The API also returns the customer's
 * name, email, phone and full address; none of that is carried through, so a forwarded link
 * leaks an order's progress rather than its owner's contact details.
 */

type EchoDeskOrder = {
  order_number?: string;
  status?: string;
  payment_status?: string;
  created_at?: string;
  confirmed_at?: string | null;
  processing_at?: string | null;
  shipped_at?: string | null;
  delivered_at?: string | null;
  tracking_number?: string;
  courier_provider?: string;
  items?: Array<{
    product_name?: Record<string, string>;
    variant_name?: Record<string, string> | null;
    quantity?: number;
  }>;
};

export function adaptTracking(raw: unknown, locale: Locale): OrderTracking | null {
  const o = raw as EchoDeskOrder | null;
  if (!o || !o.order_number) return null;

  const trackingNumber = o.tracking_number?.trim() || null;
  const courier = o.courier_provider?.trim() || null;

  // Timestamps are more reliable than the status string: a status can be renamed backend-side,
  // but `shipped_at` being set is unambiguous.
  let step: 1 | 2 | 3 | 4 = 1;
  if (o.payment_status === "paid" || o.confirmed_at) step = 2;
  if (o.processing_at) step = 3;
  if (o.shipped_at || o.delivered_at || trackingNumber) step = 4;

  return {
    name: o.order_number,
    createdAt: o.created_at ?? "",
    financialStatus: o.payment_status ?? null,
    fulfillmentStatus: o.status ?? null,
    lines: (o.items ?? []).map((i) => ({
      title: pick(i.product_name, locale),
      variantTitle: i.variant_name ? pick(i.variant_name, locale) : null,
      quantity: i.quantity ?? 1,
    })),
    tracking: trackingNumber || courier ? { company: courier, number: trackingNumber, url: null } : null,
    step,
  };
}

export async function getTrackingByToken(
  token: string,
  locale: Locale,
): Promise<OrderTracking | null> {
  const raw = await getOrderByToken(token);
  return raw ? adaptTracking(raw, locale) : null;
}
