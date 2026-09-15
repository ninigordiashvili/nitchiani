import type { CheckoutPaymentMethod } from "@/lib/shopify/orders";

/**
 * What to do once the backend has created the order.
 *
 * A card order is only half-finished at this point: the money moves on the bank's page, and
 * the gateway URL is how the customer gets there. Without one there is nowhere to send them,
 * and the order is unpaid — so it must not be treated as complete.
 *
 * That was the bug this exists to stop. The old code redirected when a URL was present and
 * otherwise fell through to "order placed", which for a card order meant the shopper saw a
 * success page, got a confirmation email and had their cart emptied, having paid nothing.
 * Cash on delivery has no gateway by nature, so for that one no URL is exactly right.
 */
export type PaymentStep =
  | { kind: "redirect"; url: string }
  | { kind: "complete" }
  | { kind: "failed" };

export function paymentStep(
  method: CheckoutPaymentMethod,
  paymentUrl: string | undefined,
): PaymentStep {
  const needsGateway = method === "bog_card" || method === "tbc_card";
  if (!needsGateway) return { kind: "complete" };
  const url = paymentUrl?.trim();
  return url ? { kind: "redirect", url } : { kind: "failed" };
}
