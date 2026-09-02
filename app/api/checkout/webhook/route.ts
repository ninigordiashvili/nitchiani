import { NextResponse } from "next/server";
import { sendOrderConfirmation } from "@/lib/email/order-confirmation";
import { verifyBogCallback } from "@/lib/payments/bog";
import { getOrderForConfirmation, markOrderPaid } from "@/lib/shopify/orders";

/**
 * Async callback from BOG. The body is signed with BOG's private key — we verify with the public
 * key from BOG_PUBLIC_KEY env. Once verified and the payment is completed, we mark the matching
 * Shopify order as paid via a sale transaction.
 *
 * BOG callback shape (per their docs — confirm against your sandbox):
 * {
 *   "event": "order_payment",
 *   "zoned_request_time": "...",
 *   "body": {
 *     "order_id": "<bog uuid>",
 *     "external_order_id": "<our shopify order id>",
 *     "order_status": { "key": "completed" | "rejected" | "refunded" | ... },
 *     "payment_detail": { ... }
 *   }
 * }
 */
export async function POST(req: Request) {
  const rawBody = await req.text();
  const signature = req.headers.get("callback-signature") ?? "";

  if (!verifyBogCallback(rawBody, signature)) {
    console.warn("[webhook/bog] signature verification failed");
    return NextResponse.json({ ok: false, error: "invalid_signature" }, { status: 401 });
  }

  type BogCallback = {
    event?: string;
    body?: {
      order_id?: string;
      external_order_id?: string;
      order_status?: { key?: string };
    };
  };
  let parsed: BogCallback;
  try {
    parsed = JSON.parse(rawBody) as BogCallback;
  } catch {
    return NextResponse.json({ ok: false, error: "bad_json" }, { status: 400 });
  }

  const status = parsed.body?.order_status?.key;
  const externalOrderId = parsed.body?.external_order_id;

  if (status !== "completed" || !externalOrderId) {
    // Acknowledge non-completed events so BOG stops retrying. Logging covers reconciliation.
    console.info("[webhook/bog] non-success event:", { status, externalOrderId });
    return NextResponse.json({ ok: true });
  }

  const numericId = Number.parseInt(externalOrderId, 10);
  if (!Number.isFinite(numericId)) {
    console.error("[webhook/bog] external_order_id is not numeric:", externalOrderId);
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const result = await markOrderPaid(numericId, "bog_card").catch((err) => {
    console.error("[webhook/bog] markOrderPaid threw:", err);
    return "failed" as const;
  });

  // Fire the confirmation email once the gateway has confirmed payment. We `void` the
  // chain so a slow/failed Shopify-Admin fetch or email-provider hiccup doesn't make BOG
  // think the webhook failed (which would trigger retries we don't need).
  //
  // Only on `marked` — BOG replays this callback until it gets a 2xx, and `already` means a
  // previous delivery settled the order and sent the email. Emailing again would spam the
  // customer with a duplicate confirmation for a single purchase.
  if (result === "marked") {
    void getOrderForConfirmation(numericId)
      .then((order) => {
        if (order) return sendOrderConfirmation(order);
        console.warn("[webhook/bog] order not retrievable for confirmation email:", numericId);
        return false;
      })
      .catch((err) => {
        console.error("[webhook/bog] confirmation email threw:", err);
      });
  }

  // `already` is a success for acknowledgement purposes — the order is settled, so BOG should
  // stop retrying. Only a genuine write failure gets a falsy ack.
  return NextResponse.json({ ok: result !== "failed", result });
}
