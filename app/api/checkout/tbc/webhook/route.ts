import { NextResponse } from "next/server";
import { getTbcPayment } from "@/lib/payments/tbc";
import { markOrderPaid } from "@/lib/shopify/orders";

/**
 * TBC server-to-server callback. Body is NOT cryptographically signed by TBC, so we never trust the
 * body's status field. Instead we extract the payId, query TBC's API with our access token to get
 * the canonical status, and only then update Shopify.
 *
 * TBC also passes our `extra` (which we set to the Shopify numeric order ID) — we use that to
 * know which Shopify order to mark paid.
 */
export async function POST(req: Request) {
  const url = new URL(req.url);
  const shopifyHint = url.searchParams.get("shopify");

  let body: { payId?: string; PayId?: string; extra?: string } = {};
  try {
    body = (await req.json()) as typeof body;
  } catch {
    // Some TBC environments send form-encoded callbacks
    const text = await req.text().catch(() => "");
    const params = new URLSearchParams(text);
    body = { payId: params.get("payId") ?? undefined, extra: params.get("extra") ?? undefined };
  }

  const payId = body.payId ?? body.PayId;
  if (!payId) {
    console.warn("[tbc/webhook] missing payId in callback body");
    return NextResponse.json({ ok: false, error: "missing_payId" }, { status: 400 });
  }

  const details = await getTbcPayment(payId).catch((err) => {
    console.error("[tbc/webhook] status fetch threw:", err);
    return null;
  });

  if (!details) {
    return NextResponse.json({ ok: false, error: "status_unavailable" }, { status: 502 });
  }

  if (details.status !== "Succeeded") {
    console.info("[tbc/webhook] non-success status:", details.status);
    return NextResponse.json({ ok: true, status: details.status });
  }

  const externalOrderId = details.externalOrderId ?? body.extra ?? shopifyHint;
  const numericId = externalOrderId ? Number.parseInt(externalOrderId, 10) : NaN;
  if (!Number.isFinite(numericId)) {
    console.error("[tbc/webhook] external order id missing or non-numeric:", externalOrderId);
    return NextResponse.json({ ok: false, error: "bad_external_order_id" }, { status: 400 });
  }

  const ok = await markOrderPaid(numericId, "tbc_card").catch((err) => {
    console.error("[tbc/webhook] markOrderPaid threw:", err);
    return false;
  });

  return NextResponse.json({ ok });
}
