"use client";

import { Ruler, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useFocusTrap } from "@/lib/ui/use-focus-trap";
import { useSwipeDismiss } from "@/lib/ui/use-swipe-dismiss";

/**
 * Inline "Size guide" link + modal. Self-contained — owns its own open state, scroll lock,
 * and ESC handler so it can drop in next to any variant picker label without prop-drilling.
 *
 * Single modal covers both bonnets (S/M/L by head circumference) and extension lengths
 * (inch / cm / where it falls on the body). The user reads the section that matters to them;
 * we don't try to detect product category and split the modal — keeps copy authoring simple
 * and works whether the product is a bonnet, an extension, or a future SKU we haven't named.
 */
export function SizeGuideButton() {
  const t = useTranslations("product");
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
        className="inline-flex cursor-pointer items-center gap-1 text-[11px] opacity-70 underline-offset-2 hover:underline hover:opacity-100"
      >
        <Ruler size={12} />
        {t("sizeGuide")}
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
          aria-label={t("sizeGuide")}
          className="absolute right-0 bottom-0 left-0 max-h-[88dvh] overflow-y-auto rounded-t-2xl transition-transform duration-200 ease-[var(--ease-brand)] sm:right-1/2 sm:bottom-1/2 sm:left-1/2 sm:max-h-[80dvh] sm:w-[min(560px,90vw)] sm:translate-x-[-50%] sm:translate-y-[50%] sm:rounded-2xl"
          style={{
            background: "var(--color-brand-cream)",
            transform: open
              ? dragOffset > 0
                ? `translateY(${dragOffset}px)`
                : undefined
              : "translateY(100%)",
            ...(dragOffset > 0 ? { transition: "none" } : {}),
          }}
        >
          <div className="flex items-center justify-between border-b border-black/10 px-5 py-4">
            <p className="font-display text-xl">{t("sizeGuide")}</p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="-mr-2 flex h-9 w-9 cursor-pointer items-center justify-center"
            >
              <X size={18} />
            </button>
          </div>

          <div className="space-y-7 p-5 sm:p-6">
            <section>
              <p className="label-eyebrow mb-3">{t("sizeGuideBonnet")}</p>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[10px] tracking-[0.14em] uppercase opacity-60">
                    <th className="pb-2 font-medium">{t("sizeGuideSize")}</th>
                    <th className="pb-2 font-medium">{t("sizeGuideHeadCirc")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/10">
                  <SizeRow size="S" measure="52–55 cm" />
                  <SizeRow size="M" measure="56–58 cm" />
                  <SizeRow size="L" measure="59–62 cm" />
                </tbody>
              </table>
              <p className="mt-2 text-xs opacity-60">{t("sizeGuideBonnetHint")}</p>
            </section>

            <section>
              <p className="label-eyebrow mb-3">{t("sizeGuideLength")}</p>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[10px] tracking-[0.14em] uppercase opacity-60">
                    <th className="pb-2 font-medium">{t("sizeGuideLengthIn")}</th>
                    <th className="pb-2 font-medium">{t("sizeGuideLengthCm")}</th>
                    <th className="pb-2 font-medium">{t("sizeGuideFallsAt")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/10">
                  <LengthRow inches="14&quot;" cm="36 cm" falls={t("sizeGuideChest")} />
                  <LengthRow inches="18&quot;" cm="46 cm" falls={t("sizeGuideMidBack")} />
                  <LengthRow inches="22&quot;" cm="56 cm" falls={t("sizeGuideWaist")} />
                  <LengthRow inches="26&quot;" cm="66 cm" falls={t("sizeGuideLowerBack")} />
                </tbody>
              </table>
              <p className="mt-2 text-xs opacity-60">{t("sizeGuideLengthHint")}</p>
            </section>

            <p className="border-t border-black/10 pt-4 text-xs opacity-60">
              {t("sizeGuideFooter")}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

function SizeRow({ size, measure }: { size: string; measure: string }) {
  return (
    <tr>
      <td className="py-2 font-medium">{size}</td>
      <td className="py-2 tabular-nums opacity-80">{measure}</td>
    </tr>
  );
}

function LengthRow({
  inches,
  cm,
  falls,
}: {
  inches: string;
  cm: string;
  falls: string;
}) {
  return (
    <tr>
      <td className="py-2 font-medium tabular-nums">{inches}</td>
      <td className="py-2 tabular-nums opacity-80">{cm}</td>
      <td className="py-2 opacity-80">{falls}</td>
    </tr>
  );
}
