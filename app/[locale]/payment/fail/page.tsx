import { redirect } from "next/navigation";
import type { Locale } from "@/lib/i18n/config";

/** The failed-payment twin of /payment/success — forwards to our /checkout/failed page. */
export default async function PaymentFailRedirect({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  redirect(`/${locale}/checkout/failed`);
}
