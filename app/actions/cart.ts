"use server";

import { isEchoDeskConfigured, lookupProduct } from "@/lib/echodesk/client";
import { checkCartLines, type CartCheck } from "@/lib/echodesk/cart-check";
import { getOrderByToken } from "@/lib/echodesk/orders";

/**
 * What the shop currently says about the lines in the bag: which products it no longer sells,
 * so the cart can drop them on load rather than let checkout fail on them, and how much is
 * left of the rest, so the quantity limits are today's rather than the ones captured when
 * each line was added. Empty when EchoDesk isn't the backend, or when it can't be reached —
 * not knowing is never a reason to remove anything or to lower a limit.
 */
export async function checkCartLinesAction(variantIds: string[]): Promise<CartCheck> {
  const empty: CartCheck = { gone: [], stock: [] };
  if (!isEchoDeskConfigured || variantIds.length === 0) return empty;
  // A bag is a handful of lines; anything larger is not a real bag.
  return checkCartLines(variantIds.slice(0, 50), lookupProduct).catch(() => empty);
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
