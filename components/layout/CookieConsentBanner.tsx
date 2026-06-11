"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/routing";
import { useCookieConsent } from "@/lib/ui/cookie-consent";

/**
 * Bottom-of-viewport consent banner. Self-hides once a decision exists (or while
 * the provider is still hydrating, to avoid an SSR/CSR mismatch flash).
 *
 * Non-blocking on purpose — the user can keep browsing while deciding. We render
 * inside the layout's overlay stack so it sits above the BottomNav on mobile.
 */
export function CookieConsentBanner() {
  const t = useTranslations("cookies");
  const { decision, hydrating, setDecision } = useCookieConsent();

  if (hydrating || decision) return null;

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
        className="container-shop mx-auto rounded-lg border border-black/10 p-4 shadow-lg sm:p-5"
        style={{ background: "var(--surface-elevated)" }}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium leading-snug">{t("title")}</p>
            <p className="mt-1 text-xs leading-relaxed opacity-80">
              {t.rich("body", {
                link: (chunks) => (
                  <Link href="/privacy" className="underline underline-offset-2">
                    {chunks}
                  </Link>
                ),
              })}
            </p>
          </div>
          <div className="flex flex-shrink-0 gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => setDecision("rejected")}
              className="cursor-pointer rounded-md border border-black/20 px-3 py-2 text-xs font-medium tracking-wider uppercase transition-colors hover:bg-black/5"
            >
              {t("rejectAll")}
            </button>
            <button
              type="button"
              onClick={() => setDecision("accepted")}
              className="btn-primary px-4 py-2 text-xs"
            >
              {t("acceptAll")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
