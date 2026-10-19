import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { ArrowLeft, XCircle } from "lucide-react";
import { Link } from "@/lib/i18n/routing";
import type { Locale } from "@/lib/i18n/config";
import { OrderNumber } from "@/components/commerce/OrderNumber";
import { SettlePendingPayment } from "@/components/cart/SettlePendingPayment";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "checkout" });
  // A failed-payment page is personal and reached with `?order=` / `?token=` in the URL — it must
  // never be indexed. This used to come from the shared checkout layout; `/checkout` itself
  // is now indexable, so the directive lives here, on the page that actually needs it.
  return { title: t("failedTitle"), robots: { index: false, follow: true } };
}

export default async function CheckoutFailed({
  params,
  searchParams,
}: {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<{ order?: string }>;
}) {
  const { locale } = await params;
  const { order } = await searchParams;
  setRequestLocale(locale);
  const [t, tCart] = await Promise.all([
    getTranslations("checkout"),
    getTranslations("cart"),
  ]);

  return (
    <div className="container-shop flex min-h-[60vh] flex-col items-center justify-center gap-4 py-12 text-center">
      <SettlePendingPayment outcome="failed" />
      <XCircle size={48} className="opacity-70" />
      <h1 className="font-display text-3xl tracking-tight sm:text-4xl">
        {t("failedTitle")}
      </h1>
      <p className="max-w-sm text-sm opacity-70">{t("failedDesc")}</p>
      {order ? <OrderNumber number={order} /> : null}
      <div className="mt-3 flex gap-3">
        <Link href="/checkout" className="btn-primary">
          {t("placeOrder")}
        </Link>
        <Link href="/" className="btn-ghost">
          <ArrowLeft size={14} />
          {tCart("continueShopping")}
        </Link>
      </div>
    </div>
  );
}
