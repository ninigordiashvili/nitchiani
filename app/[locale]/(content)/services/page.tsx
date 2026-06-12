import type { Metadata } from "next";
import Image from "next/image";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { ArrowRight } from "lucide-react";
import { Link } from "@/lib/i18n/routing";
import { BLUR_DATA_URL } from "@/lib/images";
import { SERVICES } from "@/lib/services";
import { localeAlternates } from "@/lib/seo";
import type { Locale } from "@/lib/i18n/config";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "services" });
  return {
    title: t("title"),
    description: t("subtitle"),
    alternates: localeAlternates(locale, "/services"),
  };
}

export default async function ServicesPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("services");

  return (
    <div className="container-shop pb-8 sm:pb-12">
      <header className="mb-8">
        <p className="label-eyebrow mb-1.5">Tbilisi studio</p>
        <h1 className="font-display text-3xl tracking-tight sm:text-4xl">{t("title")}</h1>
        <p className="mt-2 max-w-prose text-sm opacity-70">{t("subtitle")}</p>
      </header>

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SERVICES.map((s) => (
          <li key={s.slug}>
            <Link
              href={`/services/${s.slug}`}
              className="group block overflow-hidden border border-black/10"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image
                  src={s.image}
                  alt={locale === "ka" ? s.titleKa : s.titleEn}
                  fill
                  sizes="(min-width: 1024px) 33vw, 100vw"
                  placeholder="blur"
                  blurDataURL={BLUR_DATA_URL}
                  className="object-cover transition-transform duration-500 ease-[var(--ease-brand)] group-hover:scale-105"
                />
              </div>
              <div className="p-5">
                <p className="font-display text-xl leading-tight">
                  {locale === "ka" ? s.titleKa : s.titleEn}
                </p>
                <p className="mt-1 text-sm opacity-70">
                  {locale === "ka" ? s.descKa : s.descEn}
                </p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xs opacity-70">
                    {Math.round(s.durationMinutes / 60) || (s.durationMinutes / 60).toFixed(1)}h ·{" "}
                    {t("from")} ₾{s.priceFrom}
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs font-medium uppercase tracking-[0.16em]">
                    {t("book")} <ArrowRight size={14} />
                  </span>
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
