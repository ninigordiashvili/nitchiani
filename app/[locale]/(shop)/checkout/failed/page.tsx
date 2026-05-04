import { setRequestLocale, getTranslations } from "next-intl/server";
import { XCircle } from "lucide-react";
import { Link } from "@/lib/i18n/routing";
import type { Locale } from "@/lib/i18n/config";

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
  const t = await getTranslations("checkout");

  return (
    <div className="container-shop flex min-h-[60vh] flex-col items-center justify-center gap-4 py-12 text-center">
      <XCircle size={48} className="opacity-70" />
      <h1 className="font-display text-3xl tracking-tight sm:text-4xl">
        {t("failedTitle")}
      </h1>
      <p className="max-w-sm text-sm opacity-70">{t("failedDesc")}</p>
      {order ? <p className="label-eyebrow">Order {order}</p> : null}
      <div className="mt-3 flex gap-3">
        <Link href="/checkout" className="btn-primary">
          {t("placeOrder")}
        </Link>
        <Link href="/" className="btn-ghost">
          ←
        </Link>
      </div>
    </div>
  );
}
