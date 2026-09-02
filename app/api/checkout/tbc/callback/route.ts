import { NextResponse } from "next/server";
import { sendOrderConfirmation } from "@/lib/email/order-confirmation";
import { getTbcPayment } from "@/lib/payments/tbc";
import { getOrderForConfirmation, markOrderPaid } from "@/lib/shopify/orders";

/**
 * Browser redirect-back from TBC. Unlike BOG, TBC does not pass the payId in the URL by default —
 * we either store it server-side at create time or read it from the query if the merchant configured
 * `returnurl` with a placeholder. To keep things robust, we prefer querying TBC by payId if present,
 * and otherwise short-circuit to the failed page.
 *
 * This route races the async webhook (/api/checkout/tbc/webhook); either one may settle the order
 * first. `markOrderPaid` is idempotent and reports whether *this* call was the one that settled it,
 * so whichever wins sends the single confirmation email and the loser stays quiet.
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

  // Belt-and-suspenders: the customer is often back before TBC's server-to-server callback
  // lands, so settle the order here too rather than leaving it pending.
  if (succeeded && shopifyId) {
    const id = Number.parseInt(shopifyId, 10);
    if (Number.isFinite(id)) {
      const result = await markOrderPaid(id, "tbc_card").catch((err) => {
        console.error("[tbc/callback] markOrderPaid threw:", err);
        return "failed" as const;
      });

      // We got there before the webhook, so the email is ours to send. Fire-and-forget: the
      // customer is mid-redirect and shouldn't wait on Shopify Admin or the email provider.
      if (result === "marked") {
        void getOrderForConfirmation(id)
          .then((order) => {
            if (order) return sendOrderConfirmation(order);
            console.warn("[tbc/callback] order not retrievable for confirmation email:", id);
            return false;
          })
          .catch((err) => {
            console.error("[tbc/callback] confirmation email threw:", err);
          });
      }
    }
  }

  const target = succeeded
    ? `/${locale}/checkout/success?order=${encodeURIComponent(orderName)}`
    : `/${locale}/checkout/failed?order=${encodeURIComponent(orderName)}`;

  return NextResponse.redirect(new URL(target, url.origin));
}

/**
 * The locale to send the customer back into. `/api/checkout/initiate` appends `?locale=` to the
 * return URL it hands TBC; Georgian is the default for anything else, since that's the store's
 * primary market.
 */
function pickLocale(url: URL): "ka" | "en" {
  return url.searchParams.get("locale") === "en" ? "en" : "ka";
}
