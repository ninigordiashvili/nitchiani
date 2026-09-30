"use client";

import { useEffect } from "react";
import { useCart } from "@/lib/cart/store";
import { forgetPendingPayment, loadPendingPayment } from "@/lib/cart/pending-payment";

/**
 * Rendered on the pages the bank returns to. Arriving on the success page after a card
 * payment means the bag has been bought, so it empties at once rather than waiting for the
 * order lookup; arriving on the failed page keeps the bag for another try and drops the
 * pending record, since that payment is over.
 *
 * Only acts when a card payment was actually started from this browser — landing on the
 * success page by any other route leaves the bag alone.
 */
export function SettlePendingPayment({ outcome }: { outcome: "paid" | "failed" }) {
  const { clear } = useCart();
  useEffect(() => {
    if (!loadPendingPayment()) return;
    if (outcome === "paid") clear();
    else forgetPendingPayment();
  }, [outcome, clear]);
  return null;
}
