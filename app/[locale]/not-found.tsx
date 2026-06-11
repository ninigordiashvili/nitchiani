import { SearchX } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/lib/i18n/routing";

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
