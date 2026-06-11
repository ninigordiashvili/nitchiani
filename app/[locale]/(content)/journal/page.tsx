import type { Metadata } from "next";
import Image from "next/image";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { ArrowRight } from "lucide-react";
import { Link } from "@/lib/i18n/routing";
import { BLUR_DATA_URL } from "@/lib/images";
import { getAllJournalPosts } from "@/lib/journal";
import type { Locale } from "@/lib/i18n/config";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "journal" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

export default async function JournalIndexPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("journal");
  const posts = getAllJournalPosts();

  const dateFormatter = new Intl.DateTimeFormat(locale === "ka" ? "ka-GE" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="container-shop pb-12">
      <header className="mb-10 max-w-2xl">
        <p className="label-eyebrow mb-2">{t("eyebrow")}</p>
        <h1 className="font-display text-3xl tracking-tight sm:text-4xl">{t("title")}</h1>
        <p className="mt-2 text-sm opacity-70 sm:text-base">{t("subtitle")}</p>
      </header>

      <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 lg:gap-10">
        {posts.map((post) => (
          <li key={post.slug}>
            <Link href={`/journal/${post.slug}`} className="group block">
              <div className="relative aspect-[4/3] overflow-hidden bg-black/5">
                <Image
                  src={post.image}
                  alt={locale === "ka" ? post.titleKa : post.titleEn}
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  placeholder="blur"
                  blurDataURL={BLUR_DATA_URL}
                  className="object-cover transition-transform duration-500 ease-[var(--ease-brand)] group-hover:scale-105"
                />
              </div>
              <div className="mt-4">
                <p className="text-[11px] tracking-wider uppercase opacity-60">
                  {dateFormatter.format(new Date(post.publishedAt))} ·{" "}
                  {t("readingMinutes", { n: post.readingMinutes })}
                </p>
                <h2 className="font-display mt-1.5 text-xl leading-tight tracking-tight">
                  {locale === "ka" ? post.titleKa : post.titleEn}
                </h2>
                <p className="mt-2 line-clamp-3 text-sm opacity-75">
                  {locale === "ka" ? post.excerptKa : post.excerptEn}
                </p>
                <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium tracking-[0.16em] uppercase opacity-80 group-hover:opacity-100">
                  {t("readPost")} <ArrowRight size={14} />
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
