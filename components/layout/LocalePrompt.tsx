"use client";

import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { locales, type Locale } from "@/lib/i18n/config";
import { usePathname, useRouter } from "@/lib/i18n/routing";

/**
 * One-time soft prompt for visitors landing on the "wrong" locale. Compares
 * `navigator.languages` to the current URL locale; when a supported alternative ranks
 * higher in the user's browser preferences, shows a slim banner offering to switch.
 *
 * Critically, the prompt copy renders in the *suggested* locale, not the current one —
 * a Georgian-speaking visitor on `/en` should see "საიტი ხელმისაწვდომია ქართულადაც"
 * (in their own script) so they immediately recognise the site speaks their language.
 *
 * Dismissal persists in `localStorage` forever — the user said "no thanks" and we don't nag.
 */

const STORAGE_KEY = "nitchiani:locale-prompt:dismissed:v1";

/** Self-contained copy keyed by the *suggested* (target) locale. */
const PROMPT_COPY: Record<
  Locale,
  { availableIn: string; switchCta: string; dismiss: string }
> = {
  en: {
    availableIn: "This site is also available in English.",
    switchCta: "Switch to English",
    dismiss: "Dismiss",
  },
  ka: {
    availableIn: "საიტი ხელმისაწვდომია ქართულადაც.",
    switchCta: "გადართე ქართულზე",
    dismiss: "დახურვა",
  },
};

export function LocalePrompt() {
  const current = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const [suggested, setSuggested] = useState<Locale | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      if (localStorage.getItem(STORAGE_KEY)) return;
    } catch {
      // ignore — if storage is blocked, behave as never-dismissed
    }

    // Walk the browser's ordered language preferences. First supported locale that
    // *differs* from the current URL locale wins. Skips short codes like "en-US" by
    // trimming to the language part.
    const browserLangs = navigator.languages ?? [navigator.language];
    for (const lang of browserLangs) {
      const short = lang.toLowerCase().split("-")[0];
      if ((locales as readonly string[]).includes(short) && short !== current) {
        setSuggested(short as Locale);
        return;
      }
    }
  }, [current]);

  if (!suggested) return null;
  const copy = PROMPT_COPY[suggested];

  const persistDismissal = () => {
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // ignore
    }
  };

  const dismiss = () => {
    setSuggested(null);
    persistDismissal();
  };

  const switchLocale = () => {
    persistDismissal();
    router.replace(pathname, { locale: suggested });
  };

  return (
    <div
      role="region"
      aria-label={copy.availableIn}
      className="relative border-b border-black/10"
      style={{ background: "var(--color-brand-cream)" }}
    >
      <div className="container-shop flex items-center justify-center gap-3 py-2 pr-9 text-center text-xs sm:pr-12">
        <span className="opacity-80">{copy.availableIn}</span>
        <button
          type="button"
          onClick={switchLocale}
          className="flex-shrink-0 font-medium underline-offset-2 hover:underline"
          style={{ color: "var(--color-brand-maroon)" }}
        >
          {copy.switchCta}
        </button>
      </div>
      <button
        type="button"
        onClick={dismiss}
        aria-label={copy.dismiss}
        className="absolute top-1/2 right-2 flex h-7 w-7 -translate-y-1/2 cursor-pointer items-center justify-center opacity-60 hover:opacity-100 sm:right-3"
      >
        <X size={14} />
      </button>
    </div>
  );
}
