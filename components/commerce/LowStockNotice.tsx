"use client";

import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

/**
 * "Only 1 left" on the product page and in the quick view, just above the add-to-bag row.
 *
 * One line, not a box: in the quick-view popup a two-line panel pushed the buttons out of
 * view, and the fact needs a glance, not a read. The pulsing dot carries the urgency the
 * panel's size used to.
 */
export function LowStockNotice({ count, className }: { count: number; className?: string }) {
  const t = useTranslations("product");
  return (
    <p
      role="status"
      className={cn("flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[13px]", className)}
      style={{ color: "var(--color-brand-maroon-3)" }}
    >
      <span className="relative mr-0.5 flex h-2 w-2" aria-hidden>
        <span
          className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60 motion-reduce:animate-none"
          style={{ background: "var(--color-brand-maroon)" }}
        />
        <span className="relative inline-flex h-2 w-2 rounded-full" style={{ background: "var(--color-brand-maroon)" }} />
      </span>
      <span className="font-semibold">{t("lowStockTitle", { count })}</span>
      <span className="opacity-75">· {t("lowStockHint")}</span>
    </p>
  );
}

/** The same fact, as a small badge on a product card's photo. */
export function LowStockBadge({ count }: { count: number }) {
  const t = useTranslations("product");
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium shadow-sm"
      style={{ background: "var(--color-brand-cream)", color: "var(--color-brand-maroon)" }}
    >
      <span
        aria-hidden
        className="h-1.5 w-1.5 rounded-full"
        style={{ background: "var(--color-brand-maroon)" }}
      />
      {t("lowStockBadge", { count })}
    </span>
  );
}
