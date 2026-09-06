"use server";

import { isEchoDeskConfigured } from "@/lib/echodesk/client";
import { classifyPromoMessage, type PromoReason, validatePromo } from "@/lib/echodesk/promo";
import { discountFor, findCoupon } from "@/lib/cart/coupons";

/**
 * Prices a promo code for the cart UI.
 *
 * A server action rather than a client fetch so the tenant URL and the validation path stay on
 * our side, and so the cart asks exactly the same question checkout will ask later — a code
 * accepted in the cart and refused at checkout is the worst version of this feature.
 *
 * Falls back to the local registry when EchoDesk isn't configured, which keeps the sample
 * catalog's coupons working in development.
 */
export type PromoCheck =
  | { status: "valid"; code: string; discount: number }
  /**
   * `reason` is a translatable key rather than the backend's English sentence, so a Georgian
   * shopper reads Georgian. `minSubtotal` lets the UI name the actual threshold when we know
   * it — "min. order ₾100" beats "invalid".
   */
  | { status: "invalid"; reason: PromoReason; minSubtotal?: number }
  | { status: "unavailable" };

export async function checkPromoAction(code: string, subtotal: number): Promise<PromoCheck> {
  const trimmed = code.trim();
  if (!trimmed) return { status: "invalid", reason: "notFound" };

  if (isEchoDeskConfigured) {
    const result = await validatePromo(trimmed, subtotal);
    // `null` means we couldn't reach the backend — distinct from "the code is bad", because
    // telling someone their valid code is invalid loses the sale.
    if (!result) return { status: "unavailable" };
    if (!result.valid) {
      return { status: "invalid", reason: classifyPromoMessage(result.message) };
    }
    return {
      status: "valid",
      code: trimmed.toUpperCase(),
      discount: result.discountAmount ?? 0,
    };
  }

  const found = findCoupon(trimmed);
  if (!found) return { status: "invalid", reason: "notFound" };
  if (found.minSubtotal && subtotal < found.minSubtotal) {
    return { status: "invalid", reason: "minimum", minSubtotal: found.minSubtotal };
  }
  return { status: "valid", code: found.code, discount: discountFor(subtotal, found) };
}
