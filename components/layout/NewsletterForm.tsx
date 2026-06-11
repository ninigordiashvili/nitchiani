"use client";

import { ArrowRight, Check } from "lucide-react";
import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/routing";

/**
 * Newsletter signup band for the footer (dark surface). Validates email shape locally,
 * posts to `/api/newsletter` (which forwards to Resend's audiences API), and renders
 * loading / success / error states inline.
 *
 * Inline consent copy under the input is required for the Georgian Personal Data
 * Protection Act + GDPR-style affirmative-opt-in pattern. Submitting the form counts as
 * the affirmative act; the copy makes the disclosure visible at the point of consent.
 */
export function NewsletterForm() {
  const t = useTranslations("footer");
  const locale = useLocale() as "en" | "ka";
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "submitting" | "success" | "error">("idle");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return;

    setState("submitting");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed, locale }),
      });
      if (!res.ok) {
        setState("error");
        return;
      }
      setState("success");
      setEmail("");
    } catch {
      setState("error");
    }
  };

  return (
    <div className="grid gap-5 sm:grid-cols-[1fr_auto] sm:items-start">
      <div>
        <p className="label-eyebrow mb-2 text-[var(--color-brand-silver)]">
          {t("newsletter")}
        </p>
        <p className="font-display text-2xl tracking-tight sm:text-3xl">
          {t("newsletterDesc")}
        </p>
      </div>

      {state === "success" ? (
        <p className="inline-flex items-center gap-2 py-2 text-sm">
          <Check size={16} className="flex-shrink-0" />
          <span>{t("newsletterSuccess")}</span>
        </p>
      ) : (
        <div className="w-full max-w-md sm:min-w-[360px]">
          <form onSubmit={onSubmit} className="flex w-full gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (state === "error") setState("idle");
              }}
              placeholder={t("emailPlaceholder")}
              required
              aria-label={t("emailPlaceholder")}
              autoComplete="email"
              className="flex-1 rounded-md border border-white/20 bg-transparent px-3 py-2 text-sm text-[var(--color-brand-cream)] placeholder:text-white/40 focus:border-white/60 focus:outline-none"
            />
            <button
              type="submit"
              disabled={state === "submitting"}
              className="inline-flex flex-shrink-0 items-center gap-1.5 rounded-md border border-white/40 px-4 py-2 text-xs font-medium uppercase tracking-wider transition-colors hover:bg-white/10 disabled:opacity-50"
            >
              {t("subscribe")}
              <ArrowRight size={14} />
            </button>
          </form>

          {/* Visible disclosure right under the input, required for affirmative consent under
              Georgian / GDPR-style rules. The `<link>` interpolation lets us inline the
              Privacy Policy reference without breaking translations. */}
          <p className="mt-2 text-[11px] leading-relaxed opacity-65">
            {t.rich("newsletterConsent", {
              link: (chunks) => (
                <Link href="/privacy" className="underline underline-offset-2">
                  {chunks}
                </Link>
              ),
            })}
          </p>

          {state === "error" ? (
            <p
              role="alert"
              className="mt-2 text-[11px]"
              style={{ color: "var(--color-brand-maroon)" }}
            >
              {t("newsletterError")}
            </p>
          ) : null}
        </div>
      )}
    </div>
  );
}
