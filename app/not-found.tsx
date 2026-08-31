import { SearchX } from "lucide-react";
import "./globals.css";
import { manrope, notoSansGeorgian, notoSerifGeorgian, tenorSans } from "@/lib/fonts";
import { defaultLocale } from "@/lib/i18n/config";
import messages from "@/lib/i18n/messages/ka.json";

/**
 * Root 404 — for URLs that match no route at all (e.g. `/en/contact` once that page moved
 * to `(content)/_contact`, or any typo'd path).
 *
 * It has to render its own `<html>`/`<body>`: the root layout is a pass-through, and the
 * real document element lives in `app/[locale]/layout.tsx`. An unmatched URL never reaches
 * that layout, so without the tags below Next throws "Missing <html> and <body> tags in the
 * root layout" instead of rendering a 404.
 *
 * Copy comes straight from the default-locale message file rather than `getTranslations()`,
 * because there is no locale segment here to give next-intl a request context. Locale routes
 * that call `notFound()` still get the fully-chromed `app/[locale]/not-found.tsx`.
 */
export default function RootNotFound() {
  const t = messages.notFound;

  return (
    <html
      lang={defaultLocale}
      className={`${manrope.variable} ${tenorSans.variable} ${notoSansGeorgian.variable} ${notoSerifGeorgian.variable}`}
    >
      <body>
        <div className="container-shop flex min-h-dvh flex-col items-center justify-center gap-4 py-12 text-center">
          <SearchX size={48} className="opacity-50" />
          <p className="label-eyebrow">404</p>
          <h1 className="font-display text-3xl leading-tight tracking-tight sm:text-4xl">
            {t.title}
          </h1>
          <p className="max-w-sm text-sm opacity-70">{t.desc}</p>
          <div className="mt-3 flex flex-wrap justify-center gap-3">
            <a href={`/${defaultLocale}`} className="btn-primary">
              {messages.nav.home}
            </a>
            <a href={`/${defaultLocale}/shop`} className="btn-ghost">
              {messages.nav.shop}
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
