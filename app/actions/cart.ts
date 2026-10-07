"use server";

import { isEchoDeskConfigured, lookupProduct } from "@/lib/echodesk/client";
import { findGoneLines, type GoneLine } from "@/lib/echodesk/cart-check";
import { getOrderByToken } from "@/lib/echodesk/orders";

/**
 * Bag lines whose product the shop no longer sells, so the cart can drop them on load rather
 * than let checkout fail on them. Empty when EchoDesk isn't the backend, or when it can't be
 * reached — not knowing is never a reason to remove anything.
 */
export async function findGoneCartLinesAction(variantIds: string[]): Promise<GoneLine[]> {
  if (!isEchoDeskConfigured || variantIds.length === 0) return [];
  // A bag is a handful of lines; anything larger is not a real bag.
  return findGoneLines(variantIds.slice(0, 50), lookupProduct).catch(() => []);
}

/**
 * Where a card order's payment stands, so the bag can empty itself once it's paid. `null`
 * when the order can't be looked up — which must never be read as a verdict either way.
 */
export async function paymentStateAction(
  token: string,
): Promise<"paid" | "failed" | "pending" | null> {
  if (!isEchoDeskConfigured || !token) return null;
  const order = await getOrderByToken(token).catch(() => null);
  if (!order) return null;
  const payment = order.payment_status;
  if (payment === "paid") return "paid";
  if (payment === "failed" || order.status === "cancelled" || order.status === "refunded") return "failed";
  return "pending";
}

/**
 * The order number for a public token — the success page shows it to a shopper who comes
 * back from the bank, whose return address carries no order details. Null when it can't be
 * looked up.
 */
export async function orderNumberAction(token: string): Promise<string | null> {
  if (!isEchoDeskConfigured || !token) return null;
  const order = await getOrderByToken(token).catch(() => null);
  return typeof order?.order_number === "string" ? order.order_number : null;
}
