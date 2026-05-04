import { NextResponse } from "next/server";
import { getBogOrder } from "@/lib/payments/bog";

/**
 * Browser redirect-back from BOG. BOG appends `order_id` to the success/fail URLs configured at
 * order-create time. We use this to short-circuit a status check before the webhook arrives, so the
 * user lands on the right page without flicker. The actual order status is reconciled by the webhook.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const bogOrderId = url.searchParams.get("order_id");
  const externalOrderId = url.searchParams.get("external_order_id");

  if (!bogOrderId) {
    return NextResponse.redirect(new URL("/ka/checkout/failed", url.origin));
  }

  const details = await getBogOrder(bogOrderId).catch(() => null);
  const status = details?.status ?? "unknown";
  const orderName = externalOrderId ?? bogOrderId;

  const target =
    status === "completed"
      ? `/ka/checkout/success?order=${encodeURIComponent(orderName)}`
      : `/ka/checkout/failed?order=${encodeURIComponent(orderName)}`;

  return NextResponse.redirect(new URL(target, url.origin));
}
