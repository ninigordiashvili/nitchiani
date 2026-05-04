import { NextResponse } from "next/server";
import { getTbcPayment } from "@/lib/payments/tbc";
import { markOrderPaid } from "@/lib/shopify/orders";

/**
 * Browser redirect-back from TBC. Unlike BOG, TBC does not pass the payId in the URL by default —
 * we either store it server-side at create time or read it from the query if the merchant configured
 * `returnurl` with a placeholder. To keep things robust, we prefer querying TBC by payId if present,
 * and otherwise short-circuit to the failed page.
 *
 * The async webhook (/api/checkout/tbc/webhook) is the source of truth for marking Shopify paid;
 * this route is for routing the user UI only.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const payId = url.searchParams.get("payId");
  const orderName = url.searchParams.get("order") ?? payId ?? "";
  const shopifyId = url.searchParams.get("shopify");
  const locale = pickLocale(url);

  // No payId in URL → assume failure routing
  if (!payId) {
    return NextResponse.redirect(
      new URL(`/${locale}/checkout/failed?order=${encodeURIComponent(orderName)}`, url.origin),
    );
  }

  const details = await getTbcPayment(payId).catch(() => null);
  const succeeded = details?.status === "Succeeded";

  // Belt-and-suspenders: if the webhook hasn't landed yet but the customer is back, attempt to mark
  // paid here too (markOrderPaid is idempotent enough — Shopify will record duplicate transactions
  // but the order's financial_status flips to paid on the first successful sale).
  if (succeeded && shopifyId) {
    const id = Number.parseInt(shopifyId, 10);
    if (Number.isFinite(id)) {
      await markOrderPaid(id, "tbc_card").catch((err) =>
        console.error("[tbc/callback] markOrderPaid threw:", err),
      );
    }
  }

  const target = succeeded
    ? `/${locale}/checkout/success?order=${encodeURIComponent(orderName)}`
    : `/${locale}/checkout/failed?order=${encodeURIComponent(orderName)}`;

  return NextResponse.redirect(new URL(target, url.origin));
}

function pickLocale(url: URL): "ka" | "en" {
  const referer = url.searchParams.get("locale");
  return referer === "en" ? "en" : "ka";
}
