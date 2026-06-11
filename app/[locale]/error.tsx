"use client";

import { AlertOctagon, RotateCcw } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { Link } from "@/lib/i18n/routing";

/**
 * Branded runtime-error boundary for locale routes. Must be a client component (Next.js
 * App Router requirement). `reset()` re-renders the failed segment in place — usually
 * enough for transient network blips; persistent bugs land the user on "Home" via the
 * fallback link.
 *
 * In production we'd ship the `error.digest` to Sentry / a log drain here. For now we
 * just surface it in the eyebrow so support has something to copy when a customer
 * reports an issue.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations();

  useEffect(() => {
    // Swap this for the real error reporter when wiring up monitoring.
    console.error("[error boundary]", error);
  }, [error]);

  return (
    <div className="container-shop flex min-h-[60vh] flex-col items-center justify-center gap-4 py-12 text-center">
      <AlertOctagon size={48} className="opacity-50" />
      <p className="label-eyebrow tabular-nums">{error.digest ?? "ERROR"}</p>
      <h1 className="font-display text-3xl leading-tight tracking-tight sm:text-4xl">
        {t("errorPage.title")}
      </h1>
      <p className="max-w-sm text-sm opacity-70">{t("errorPage.desc")}</p>
      <div className="mt-3 flex flex-wrap justify-center gap-3">
        <button type="button" onClick={reset} className="btn-primary">
          <RotateCcw size={16} />
          {t("common.tryAgain")}
        </button>
        <Link href="/" className="btn-ghost">
          {t("nav.home")}
        </Link>
      </div>
    </div>
  );
}
