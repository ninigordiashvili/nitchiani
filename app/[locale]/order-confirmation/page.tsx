import { redirect } from "next/navigation";
import type { Locale } from "@/lib/i18n/config";
import { getOrderByToken } from "@/lib/echodesk/orders";

/**
 * EchoDesk's storefront template confirms an order at `/order-confirmation?order_id=…&token=…`,
 * and EchoDesk may send shoppers here after paying. Our pages are /checkout/success and
 * /checkout/failed, so this decides which one from the order itself: the public token is
 * enough to look it up without an account.
 *
 * Only a definite failure goes to the failed page. Paid, still processing, or not looked up
 * all go to success — the bank only returns a shopper here after the payment step, and
 * telling someone who has paid that it failed is the worse mistake.
 */
export default async function OrderConfirmationRedirect({
  params,
  searchParams,
}: {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<{ token?: string; order_id?: string }>;
}) {
  const { locale } = await params;
  const { token } = await searchParams;

  const order = token ? await getOrderByToken(token).catch(() => null) : null;
  const failed =
    order?.payment_status === "failed" || order?.status === "cancelled" || order?.status === "refunded";
  const number = typeof order?.order_number === "string" ? order.order_number : undefined;

  const qs = new URLSearchParams();
  if (number) qs.set("order", number);
  // Only a token that found an order is worth a tracking link.
  if (token && order && !failed) qs.set("token", token);
  const query = qs.toString() ? `?${qs}` : "";

  redirect(`/${locale}/checkout/${failed ? "failed" : "success"}${query}`);
}
