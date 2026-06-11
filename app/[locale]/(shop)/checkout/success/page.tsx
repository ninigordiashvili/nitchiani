import { setRequestLocale, getTranslations } from "next-intl/server";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { Link } from "@/lib/i18n/routing";
import type { Locale } from "@/lib/i18n/config";

export default async function CheckoutSuccess({
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
      <CheckCircle2 size={48} className="text-[var(--color-brand-maroon)]" />
      <h1 className="font-display text-3xl tracking-tight sm:text-4xl">
        {t("successTitle")}
      </h1>
      <p className="max-w-sm text-sm opacity-70">{t("successDesc")}</p>
      {order ? <p className="label-eyebrow tabular-nums">{t("orderNumber", { id: order })}</p> : null}
      <div className="mt-3 flex flex-wrap justify-center gap-3">
        <Link
          href={order ? `/order-status?order=${order}` : "/order-status"}
          className="btn-primary"
        >
          {t("trackOrder")}
        </Link>
        <Link href="/" className="btn-ghost">
          <ArrowLeft size={14} />
          {tCart("continueShopping")}
        </Link>
      </div>
    </div>
  );
}
