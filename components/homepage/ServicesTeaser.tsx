import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/lib/i18n/routing";
import { BLUR_DATA_URL } from "@/lib/images";
import { SERVICES } from "@/lib/services";
import type { Locale } from "@/lib/i18n/config";

export function ServicesTeaser() {
  const t = useTranslations();
  const locale = useLocale() as Locale;

  return (
    <section
      className="py-10 sm:py-12"
      style={{ background: "var(--color-brand-bg)", color: "var(--color-brand-cream)" }}
    >
      <div className="container-shop">
        <div className="mb-8 flex flex-col gap-4 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-xl">
            <p className="label-eyebrow mb-2 text-[var(--color-brand-silver)]">
              {t("home.services")}
            </p>
            <h2 className="font-display text-3xl leading-[1.05] tracking-tight sm:text-4xl">
              {t("home.bookSession")}
            </h2>
            <p className="mt-3 text-sm opacity-80 sm:text-base">
              {t("home.bookSessionDesc")}
            </p>
          </div>
          <Link
            href="/services"
            className="inline-flex items-center gap-1 self-start text-xs font-medium uppercase tracking-[0.16em] sm:self-end"
          >
            {t("home.viewAll")} <ArrowRight size={14} />
          </Link>
        </div>

        <ul className="grid gap-4 sm:grid-cols-3">
          {SERVICES.map((s) => (
            <li key={s.slug}>
              <Link
                href={`/services/${s.slug}`}
                className="group block overflow-hidden rounded-lg bg-white/5 transition-colors hover:bg-white/10"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image
                    src={s.image}
                    alt={locale === "ka" ? s.titleKa : s.titleEn}
                    fill
                    sizes="(min-width: 640px) 33vw, 100vw"
                    placeholder="blur"
                    blurDataURL={BLUR_DATA_URL}
                    className="object-cover transition-transform duration-500 ease-[var(--ease-brand)] group-hover:scale-105"
                  />
                </div>
                <div className="p-4">
                  <p className="font-display text-lg leading-tight">
                    {locale === "ka" ? s.titleKa : s.titleEn}
                  </p>
                  <p className="mt-1 text-xs opacity-70">
                    {Math.round(s.durationMinutes / 60)}h · {t("services.from")} ₾{s.priceFrom}
                  </p>
                  <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium uppercase tracking-[0.16em]">
                    {t("services.book")} <ArrowRight size={14} />
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
