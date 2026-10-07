"use client";

import { X } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/routing";
import { usePolicyNotice } from "@/lib/ui/policy-notice";

/**
 * In-flow notice that the Privacy Policy changed, shown under the promo strip.
 *
 * In flow rather than fixed, and at the top rather than the bottom, so it never competes
 * with the fixed CookieConsentBanner — that one asks for a decision and has to be answered,
 * this one is information and can be scrolled past. Two overlapping banners at the bottom
 * edge would have made the one that matters harder to act on.
 *
 * `role="status"` not `role="dialog"`: nothing is blocked and nothing is being asked.
 *
 * `version` is passed in rather than imported so `lib/legal.ts` — every word of all three
 * policies — stays out of the client bundle.
 */
export function PolicyUpdateStrip({ version }: { version: string }) {
  const t = useTranslations("policyNotice");
  const { show, dismiss } = usePolicyNotice(version);

  if (!show) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="w-full border-b border-black/10"
      style={{ background: "var(--surface-elevated)" }}
    >
      <div className="container-shop flex items-start gap-3 py-2.5 sm:items-center">
        <p className="min-w-0 flex-1 text-xs leading-relaxed opacity-80">
          {t.rich("body", {
            link: (chunks) => (
              <Link href="/privacy" className="font-medium underline underline-offset-2">
                {chunks}
              </Link>
            ),
          })}
        </p>
        <button
          type="button"
          onClick={dismiss}
          aria-label={t("dismiss")}
          className="-mr-1 flex-shrink-0 cursor-pointer rounded p-1 opacity-60 transition-opacity hover:opacity-100"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
