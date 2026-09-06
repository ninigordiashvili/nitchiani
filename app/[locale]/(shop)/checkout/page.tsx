import { setRequestLocale } from "next-intl/server";
import { CheckoutForm } from "./CheckoutForm";
import { getStoreConfig, listShippingMethods } from "@/lib/echodesk/client";
import { envPaymentAvailability, paymentAvailability } from "@/lib/echodesk/payments";
import { isEchoDeskConfigured } from "@/lib/echodesk/client";
import { deliveryChoices } from "@/lib/echodesk/shipping";
import type { Locale } from "@/lib/i18n/config";

/**
 * Server shell for checkout. It exists to read what the shop actually offers — which payment
 * methods are live, and which delivery methods are configured — before the form renders.
 *
 * The form itself is a client component and used to decide this from `NEXT_PUBLIC_*` env vars.
 * Those are a copy of settings that live in EchoDesk, and the copy went stale: the storefront
 * offered card payment while the tenant had cards switched off, so the only method a shopper
 * could choose was the one the backend would refuse. Reading it here means the answer comes
 * from the same place the order is placed, and a change in EchoDesk needs no deploy.
 */
export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [config, methods] = await Promise.all([
    isEchoDeskConfigured ? getStoreConfig() : Promise.resolve(null),
    isEchoDeskConfigured ? listShippingMethods() : Promise.resolve(null),
  ]);

  return (
    <CheckoutForm
      payments={isEchoDeskConfigured ? paymentAvailability(config) : envPaymentAvailability()}
      delivery={deliveryChoices(methods?.results ?? [], locale)}
      pickup={config?.pickup?.enabled ? (config.pickup ?? null) : null}
    />
  );
}
