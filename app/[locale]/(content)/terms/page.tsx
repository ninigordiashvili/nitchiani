import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { TERMS_LAST_UPDATED, TERMS_SECTIONS } from "@/lib/legal";
import type { Locale } from "@/lib/i18n/config";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "terms" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

export default async function TermsPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("terms");

  const dateFormatter = new Intl.DateTimeFormat(locale === "ka" ? "ka-GE" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="container-shop pb-12">
      <div className="mx-auto max-w-2xl">
        <header className="mb-10">
          <p className="label-eyebrow mb-2">{t("eyebrow")}</p>
          <h1 className="font-display text-3xl tracking-tight sm:text-4xl">{t("title")}</h1>
          <p className="mt-3 text-xs tracking-wider uppercase opacity-60">
            {t("lastUpdated", { date: dateFormatter.format(new Date(TERMS_LAST_UPDATED)) })}
          </p>
          <p className="mt-4 text-sm leading-relaxed opacity-80">{t("intro")}</p>
        </header>

        <div className="space-y-8">
          {TERMS_SECTIONS.map((section, i) => {
            const heading = locale === "ka" ? section.headingKa : section.headingEn;
            const body = locale === "ka" ? section.bodyKa : section.bodyEn;
            return (
              <section key={i}>
                <h2 className="font-display text-xl leading-tight tracking-tight">{heading}</h2>
                <div className="mt-3 space-y-3 text-sm leading-relaxed opacity-90">
                  {body.split("\n\n").map((paragraph, pi) => (
                    <p key={pi}>{paragraph}</p>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}
