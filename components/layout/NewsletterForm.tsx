"use client";

import { ArrowRight, Check } from "lucide-react";
import { useState } from "react";
import { useTranslations } from "next-intl";

/**
 * Newsletter signup band for the footer (dark surface). Validates email shape locally and
 * shows a success state on submit.
 *
 * Backend integration is deliberately stubbed: there's no `/api/newsletter` route yet, so
 * the handler just simulates a brief delay and accepts. When you wire ConvertKit / Mailchimp
 * / etc., replace the body of `onSubmit` with the real fetch — the surrounding state machine
 * already handles the loading + success transitions.
 */
export function NewsletterForm() {
  const t = useTranslations("footer");
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "submitting" | "success">("idle");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    // Loose email shape check — defer strict validation to the provider when we ship one.
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return;
    setState("submitting");
    // Tiny visible delay so the click registers as a "thing that happened", even before a
    // real backend lands.
    await new Promise((r) => setTimeout(r, 400));
    setState("success");
    setEmail("");
  };

  return (
    <div className="grid gap-5 sm:grid-cols-[1fr_auto] sm:items-center">
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
        <form
          onSubmit={onSubmit}
          className="flex w-full max-w-md gap-2 sm:min-w-[360px]"
        >
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
      )}
    </div>
  );
}
