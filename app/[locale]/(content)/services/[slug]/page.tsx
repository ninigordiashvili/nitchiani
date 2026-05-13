import Image from "next/image";
import { notFound } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Clock, Tag } from "lucide-react";
import { CalEmbed } from "@/components/booking/CalEmbed";
import { BLUR_DATA_URL } from "@/lib/images";
import { getServiceBySlug, SERVICES } from "@/lib/services";
import type { Locale } from "@/lib/i18n/config";

export function generateStaticParams() {
  return SERVICES.map((s) => ({ slug: s.slug }));
}

export default async function ServiceDetail({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const service = getServiceBySlug(slug);
  if (!service) notFound();

  const t = await getTranslations("services");
  const calUsername = process.env.NEXT_PUBLIC_CAL_USERNAME ?? "nitchiani";
  const calLink = `${calUsername}/${service.calEventType}`;

  return (
    <article className="container-shop py-8 sm:py-12">
      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        <div>
          <div className="relative aspect-[4/3] w-full overflow-hidden">
            <Image
              src={service.image}
              alt={locale === "ka" ? service.titleKa : service.titleEn}
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              priority
              placeholder="blur"
              blurDataURL={BLUR_DATA_URL}
              className="object-cover"
            />
          </div>
          <header className="mt-6">
            <p className="label-eyebrow mb-2">Tbilisi studio</p>
            <h1 className="font-display text-3xl leading-tight tracking-tight sm:text-4xl">
              {locale === "ka" ? service.titleKa : service.titleEn}
            </h1>
            <p className="mt-3 max-w-prose text-sm opacity-80">
              {locale === "ka" ? service.descKa : service.descEn}
            </p>
            <ul className="mt-5 flex flex-wrap gap-4 text-sm">
              <li className="inline-flex items-center gap-2 opacity-80">
                <Clock size={16} /> {Math.round(service.durationMinutes / 60) || (service.durationMinutes / 60).toFixed(1)}h
              </li>
              <li className="inline-flex items-center gap-2 opacity-80">
                <Tag size={16} /> {t("from")} ₾{service.priceFrom}
              </li>
            </ul>
          </header>
        </div>

        <div>
          <h2 className="font-display mb-4 text-xl">{t("book")}</h2>
          <div className="border border-black/10 bg-white">
            <CalEmbed calLink={calLink} />
          </div>
        </div>
      </div>
    </article>
  );
}
