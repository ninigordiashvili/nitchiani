"use client";

import {
  ClipboardCheck,
  HelpCircle,
  Package,
  RotateCcw,
  Truck,
  X,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

/**
 * Self-contained "How it works" trigger + modal. Drops into cart drawer / cart page / checkout
 * aside to reassure first-time Georgian buyers about the post-tap flow: order → confirmation →
 * Tbilisi studio prep → courier delivery → 14-day returns. Pattern mirrors `SizeGuideButton`.
 *
 * Tone is the only variant — `light` for cream surfaces, `dark` for the (eventual) footer
 * placement. Trigger is a small underline-on-hover link, not a button — it's a passive
 * affordance, not a CTA.
 */
export function HowItWorksButton({
  tone = "light",
}: {
  tone?: "light" | "dark";
} = {}) {
  const t = useTranslations("cart");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const steps: Array<{ icon: LucideIcon; title: string; desc: string }> = [
    {
      icon: ClipboardCheck,
      title: t("howItWorksStep1Title"),
      desc: t("howItWorksStep1Desc"),
    },
    {
      icon: Package,
      title: t("howItWorksStep2Title"),
      desc: t("howItWorksStep2Desc"),
    },
    {
      icon: Truck,
      title: t("howItWorksStep3Title"),
      desc: t("howItWorksStep3Desc"),
    },
    {
      icon: RotateCcw,
      title: t("howItWorksStep4Title"),
      desc: t("howItWorksStep4Desc"),
    },
  ];

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "inline-flex cursor-pointer items-center gap-1.5 text-[11px] underline-offset-2 hover:underline",
          tone === "dark"
            ? "text-[var(--color-brand-cream)] opacity-80 hover:opacity-100"
            : "opacity-70 hover:opacity-100",
        )}
      >
        <HelpCircle size={12} />
        {t("howItWorks")}
      </button>

      <div
        aria-hidden={!open}
        className="fixed inset-0 z-50 transition-opacity"
        style={{ opacity: open ? 1 : 0, pointerEvents: open ? "auto" : "none" }}
      >
        <div
          className="absolute inset-0"
          style={{ background: "rgba(10,31,31,0.55)" }}
          onClick={() => setOpen(false)}
        />
        <div
          role="dialog"
          aria-modal="true"
          aria-label={t("howItWorks")}
          className="absolute right-0 bottom-0 left-0 max-h-[88dvh] overflow-y-auto rounded-t-2xl transition-transform duration-200 ease-[var(--ease-brand)] sm:right-1/2 sm:bottom-1/2 sm:left-1/2 sm:max-h-[80dvh] sm:w-[min(520px,92vw)] sm:translate-x-[-50%] sm:translate-y-[50%] sm:rounded-2xl"
          style={{
            background: "var(--color-brand-cream)",
            transform: open ? undefined : "translateY(100%)",
          }}
        >
          <div className="flex items-center justify-between border-b border-black/10 px-5 py-4">
            <p className="font-display text-xl">{t("howItWorks")}</p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="-mr-2 flex h-9 w-9 cursor-pointer items-center justify-center"
            >
              <X size={18} />
            </button>
          </div>

          <ol className="space-y-5 p-5 sm:p-6">
            {steps.map((step, i) => (
              <li key={i} className="flex items-start gap-4">
                <span
                  className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full"
                  style={{
                    background:
                      "color-mix(in oklab, var(--color-brand-maroon) 10%, transparent)",
                    color: "var(--color-brand-maroon)",
                  }}
                >
                  <step.icon size={18} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="flex items-baseline gap-2 text-sm font-medium">
                    <span className="text-[11px] tabular-nums opacity-50">
                      0{i + 1}
                    </span>
                    {step.title}
                  </p>
                  <p className="mt-1 text-sm leading-relaxed opacity-75">
                    {step.desc}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </>
  );
}
