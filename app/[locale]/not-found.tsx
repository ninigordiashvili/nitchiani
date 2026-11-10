import type { Metadata } from "next";
import { SearchX } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/lib/i18n/routing";
import { defaultLocale } from "@/lib/i18n/config";

/**
 * Its own title, in the page's language. Without one a missing product took the homepage
 * headline plus the "· Nitchiani" template — "… — Nitchiani · Nitchiani" — which is also
 * what a shared dead link previewed as.
 */
export async function generateMetadata(): Promise<Metadata> {
  // The default locale, named outright. A not-found page is given no params, so asking
  // next-intl for "the current locale" made it read the request headers — which a cached
  // route may not do. In production every unknown product or collection URL answered 500
  // ("Page changed from static to dynamic") instead of 404. A 404 title is not indexed, so
  // the cost of not matching the visitor's language here is nil; the page body below still is.
  const t = await getTranslations({ locale: defaultLocale, namespace: "notFound" });
  return { title: t("title") };
}

/**
 * Branded 404. Triggered by `notFound()` calls inside locale routes (e.g. the PDP page
 * when a handle doesn't resolve) and by route mismatches inside the locale segment.
 * Renders inside the locale layout so the header, footer, and chrome are intact.
 */
export default async function NotFound() {
  const t = await getTranslations();
  return (
    <div className="container-shop flex min-h-[60vh] flex-col items-center justify-center gap-4 py-12 text-center">
      <SearchX size={48} className="opacity-50" />
      <p className="label-eyebrow">404</p>
      <h1 className="font-display text-3xl leading-tight tracking-tight sm:text-4xl">
        {t("notFound.title")}
      </h1>
      <p className="max-w-sm text-sm opacity-70">{t("notFound.desc")}</p>
      <div className="mt-3 flex flex-wrap justify-center gap-3">
        <Link href="/" className="btn-primary">
          {t("nav.home")}
        </Link>
        <Link href="/shop" className="btn-ghost">
          {t("nav.shop")}
        </Link>
      </div>
    </div>
  );
}
