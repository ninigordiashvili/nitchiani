"use client";

import { Ruler, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { GAUGE_TABLE, HOOP_DIAMETERS } from "@/lib/piercings";
import { useFocusTrap } from "@/lib/ui/use-focus-trap";
import { useSwipeDismiss } from "@/lib/ui/use-swipe-dismiss";

/**
 * Piercing-specific size guide. Mirrors `SizeGuideButton`'s shape (inline link + bottom-sheet
 * modal on mobile, centred modal on desktop) but the body is the gauge ↔ mm conversion table
 * and the hoop inner-diameter chart. Renders next to the gauge variant label inside
 * `VariantPicker` when the product is in the piercings category.
 */
export function PiercingSizeGuide() {
  const t = useTranslations("piercings");
  const locale = useLocale();
  const ka = locale === "ka";
  const [open, setOpen] = useState(false);
  const { dragOffset, handlers } = useSwipeDismiss({
    direction: "down",
    onDismiss: () => setOpen(false),
    maxViewportWidth: 640,
  });
  const modalRef = useRef<HTMLDivElement>(null);
  useFocusTrap(modalRef, open);

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

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex cursor-pointer items-center gap-1.5 text-[11px] underline-offset-2 opacity-70 hover:underline hover:opacity-100"
      >
        <Ruler size={12} />
        {t("gaugeGuide")}
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
          ref={modalRef}
          {...handlers}
          role="dialog"
          aria-modal="true"
          aria-label={t("gaugeGuide")}
          className="absolute right-0 bottom-0 left-0 max-h-[88dvh] overflow-y-auto rounded-t-2xl transition-transform duration-200 ease-[var(--ease-brand)] sm:right-1/2 sm:bottom-1/2 sm:left-1/2 sm:max-h-[80dvh] sm:w-[min(32rem,92vw)] sm:translate-x-[-50%] sm:translate-y-[50%] sm:rounded-2xl"
          style={{
            background: "var(--surface)",
            transform: open
              ? dragOffset > 0
                ? `translateY(${dragOffset}px)`
                : undefined
              : "translateY(100%)",
            ...(dragOffset > 0 ? { transition: "none" } : {}),
          }}
        >
          <div className="flex items-center justify-between border-b border-black/10 px-4 py-3">
            <p className="font-display text-xl">{t("gaugeGuide")}</p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label={t("close")}
              className="-mr-2 flex h-9 w-9 cursor-pointer items-center justify-center"
            >
              <X size={18} />
            </button>
          </div>

          <div className="space-y-6 p-4 sm:p-5">
            <section>
              <p className="label-eyebrow mb-2">{t("gaugeTableLabel")}</p>
              <p className="mb-3 text-xs leading-relaxed opacity-70">{t("gaugeTableDesc")}</p>
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-black/10 text-[11px] tracking-wider uppercase opacity-60">
                    <th className="py-2 pr-3 font-medium">{t("gaugeCol")}</th>
                    <th className="py-2 pr-3 font-medium">{t("mmCol")}</th>
                    <th className="py-2 font-medium">{t("placementCol")}</th>
                  </tr>
                </thead>
                <tbody>
                  {GAUGE_TABLE.map((row) => (
                    <tr key={row.gauge} className="border-b border-black/5 last:border-b-0">
                      <td className="py-2 pr-3 font-medium tabular-nums">{row.gauge}</td>
                      <td className="py-2 pr-3 tabular-nums opacity-80">{row.mm}</td>
                      <td className="py-2 text-xs leading-relaxed opacity-80">
                        {ka ? row.placementsKa : row.placementsEn}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>

            <section>
              <p className="label-eyebrow mb-2">{t("hoopTableLabel")}</p>
              <p className="mb-3 text-xs leading-relaxed opacity-70">{t("hoopTableDesc")}</p>
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-black/10 text-[11px] tracking-wider uppercase opacity-60">
                    <th className="py-2 pr-3 font-medium">{t("diameterCol")}</th>
                    <th className="py-2 font-medium">{t("fitCol")}</th>
                  </tr>
                </thead>
                <tbody>
                  {HOOP_DIAMETERS.map((row) => (
                    <tr key={row.diameter} className="border-b border-black/5 last:border-b-0">
                      <td className="py-2 pr-3 font-medium tabular-nums">{row.diameter}</td>
                      <td className="py-2 text-xs leading-relaxed opacity-80">
                        {ka ? row.fitKa : row.fitEn}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>

            <section>
              <p className="label-eyebrow mb-2">{t("notSureLabel")}</p>
              <p className="text-xs leading-relaxed opacity-80">{t("notSureBody")}</p>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}
