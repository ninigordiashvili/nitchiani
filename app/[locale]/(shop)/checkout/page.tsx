import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { CheckoutForm } from "./CheckoutForm";
import { getStoreConfig, listShippingMethods } from "@/lib/echodesk/client";
import { envPaymentAvailability, paymentAvailability } from "@/lib/echodesk/payments";
import { isEchoDeskConfigured } from "@/lib/echodesk/client";
import { deliveryChoices } from "@/lib/echodesk/shipping";
import type { Locale } from "@/lib/i18n/config";
import { localeAlternates } from "@/lib/seo";

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
/**
 * `/checkout` is indexable, with a self-referencing canonical and the usual hreflang pair.
 *
 * Its children are not. `/checkout/success` and `/checkout/failed` read `?order=` and
 * `?token=` and each sets its own `noindex` — the directive used to sit on the shared layout,
 * which covered all three at once, so it had to move down when this page opened up.
 *
 * `metaTitle` rather than `title`: the latter is the on-page `h1` and wants to stay the short
 * imperative it is, while the document title is also the browser tab and the search result,
 * and has room to say where the shop delivers.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "checkout" });
  return {
    title: t("metaTitle"),
    alternates: localeAlternates(locale, "/checkout"),
    robots: { index: true, follow: true },
  };
}

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
