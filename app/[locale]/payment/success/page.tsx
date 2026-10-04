import { redirect } from "next/navigation";
import type { Locale } from "@/lib/i18n/config";

/**
 * Where EchoDesk sends a shopper after a successful card payment, if its return URL is left
 * at the default its own storefront template uses (`/payment/success`). Our page lives at
 * /checkout/success, so this forwards there rather than answering a paying customer with a
 * 404. The bank's own `order_id` is dropped: it isn't our order number.
 */
export default async function PaymentSuccessRedirect({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  redirect(`/${locale}/checkout/success`);
}
