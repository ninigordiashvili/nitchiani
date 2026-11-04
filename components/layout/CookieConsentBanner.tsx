"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/routing";
import { cn } from "@/lib/utils";
import { useCookieConsent } from "@/lib/ui/cookie-consent";

/**
 * Bottom-of-viewport consent banner. Self-hides once a decision exists (or while
 * the provider is still hydrating, to avoid an SSR/CSR mismatch flash).
 *
 * Non-blocking on purpose — the user can keep browsing while deciding. We render
 * inside the layout's overlay stack so it sits above the BottomNav on mobile.
 *
 * Three ways out: "Essential only", "Accept all", and "Settings", which opens a panel that
 * explains each category and lets the visitor switch analytics on by itself. "Essential only"
 * and "Accept all" are deliberately the same size and weight — declining must be exactly as
 * easy as accepting — and nothing optional is on until it is chosen.
 *
 * The only optional cookie this site sets is Google Analytics, so the panel has one switch;
 * the stored decision stays two-valued ("accepted" means analytics on). Add a category here,
 * and to the stored value, if a marketing tag is ever introduced.
 */
export function CookieConsentBanner() {
  const t = useTranslations("cookies");
  const { decision, hydrating, setDecision } = useCookieConsent();
  const [panel, setPanel] = useState(false);
  // Off until chosen — a pre-ticked box is not consent.
  const [analytics, setAnalytics] = useState(false);

  if (hydrating || decision) return null;

  const privacyLink = (chunks: React.ReactNode) => (
    <Link href="/privacy" className="underline underline-offset-2">
      {chunks}
    </Link>
  );

  // One look for both decisions, so neither is the louder button.
  const decisionButton =
    "cursor-pointer rounded-md border border-[var(--color-brand-ink)] px-4 py-2.5 text-xs font-semibold tracking-wider uppercase transition-colors";
  const filled = cn(
    decisionButton,
    "bg-[var(--color-brand-ink)] text-[var(--color-brand-cream)] hover:bg-[var(--color-brand-maroon)] hover:border-[var(--color-brand-maroon)]",
  );

  return (
    <div
      role="dialog"
      aria-label={t("title")}
      aria-live="polite"
      // Mobile: lift above the fixed BottomNav (~64px) + iOS safe-area inset so the
      // banner doesn't sit beneath the nav. Desktop (sm+): drop close to the actual
      // bottom edge — no BottomNav there to clear.
      className="fixed inset-x-0 bottom-[calc(5.5rem+env(safe-area-inset-bottom))] z-30 px-3 pb-3 sm:bottom-3 sm:px-4 sm:pb-4"
    >
      <div
        className="container-shop mx-auto max-h-[75dvh] overflow-y-auto rounded-lg border border-black/10 p-4 shadow-lg sm:p-5"
        style={{ background: "var(--surface-elevated)" }}
      >
        {panel ? (
          <div className="space-y-4">
            <p className="text-sm font-medium leading-snug">{t("title")}</p>

            <div className="divide-y divide-black/10 text-xs leading-relaxed">
              <div className="space-y-1 pb-3">
                <p className="flex items-center justify-between gap-3 text-sm font-medium">
                  {t("essentialTitle")}
                  <span className="text-xs font-normal opacity-60">{t("essentialAlways")}</span>
                </p>
                <p className="opacity-80">{t("essentialBody")}</p>
              </div>

              <div className="space-y-1 py-3">
                <div className="flex items-center justify-between gap-3">
                  <p id="cookie-analytics-label" className="text-sm font-medium">
                    {t("analyticsTitle")}
                  </p>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={analytics}
                    aria-labelledby="cookie-analytics-label"
                    onClick={() => setAnalytics((v) => !v)}
                    className={cn(
                      "relative h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border transition-colors",
                      analytics
                        ? "border-[var(--color-brand-ink)] bg-[var(--color-brand-ink)]"
                        : "border-black/25 bg-black/10",
                    )}
                  >
                    <span
                      className={cn(
                        "absolute top-0.5 left-0.5 h-[18px] w-[18px] rounded-full bg-white shadow transition-transform",
                        analytics && "translate-x-5",
                      )}
                    />
                  </button>
                </div>
                <p className="opacity-80">{t("analyticsBody")}</p>
              </div>

              <div className="space-y-1 pt-3">
                <p className="text-sm font-medium">{t("thirdPartyTitle")}</p>
                <p className="opacity-80">{t("thirdPartyBody")}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 sm:gap-3">
              <button type="button" onClick={() => setDecision(analytics ? "accepted" : "rejected")} className={filled}>
                {t("save")}
              </button>
              <button type="button" onClick={() => setDecision("rejected")} className={filled}>
                {t("rejectAll")}
              </button>
              <button type="button" onClick={() => setDecision("accepted")} className={filled}>
                {t("acceptAll")}
              </button>
            </div>

            <p className="text-xs leading-relaxed opacity-70">
              {t.rich("retention", { link: privacyLink })}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium leading-snug">{t("title")}</p>
              <p className="mt-1 text-xs leading-relaxed opacity-80">
                {t("body")}{" "}
                <Link href="/privacy" className="underline underline-offset-2">
                  {t("privacyLink")}
                </Link>
              </p>
            </div>
            <div className="flex flex-shrink-0 flex-wrap items-center gap-2 sm:gap-3">
              <button type="button" onClick={() => setDecision("rejected")} className={filled}>
                {t("rejectAll")}
              </button>
              <button
                type="button"
                onClick={() => setPanel(true)}
                className="cursor-pointer px-2 py-2.5 text-xs font-semibold tracking-wider uppercase underline underline-offset-4 opacity-80 hover:opacity-100"
              >
                {t("settings")}
              </button>
              <button type="button" onClick={() => setDecision("accepted")} className={filled}>
                {t("acceptAll")}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
