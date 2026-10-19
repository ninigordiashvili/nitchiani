import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { CheckCircle2 } from "lucide-react";
import type { Locale } from "@/lib/i18n/config";
import { SuccessOrderDetails } from "@/components/checkout/SuccessOrderDetails";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "checkout" });
  // An order confirmation is personal and reached with `?order=` / `?token=` in the URL — it must
  // never be indexed. This used to come from the shared checkout layout; `/checkout` itself
  // is now indexable, so the directive lives here, on the page that actually needs it.
  return { title: t("successTitle"), robots: { index: false, follow: true } };
}

export default async function CheckoutSuccess({
  params,
  searchParams,
}: {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<{ order?: string; token?: string }>;
}) {
  const { locale } = await params;
  const { order, token } = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations("checkout");

  return (
    <div className="container-shop flex min-h-[60vh] flex-col items-center justify-center gap-4 py-12 text-center">
      <CheckCircle2 size={48} className="text-[var(--color-brand-maroon)]" />
      <h1 className="font-display text-3xl tracking-tight sm:text-4xl">
        {t("successTitle")}
      </h1>
      <p className="max-w-sm text-sm opacity-70">{t("successDesc")}</p>
      <SuccessOrderDetails order={order} token={token} />
    </div>
  );
}
