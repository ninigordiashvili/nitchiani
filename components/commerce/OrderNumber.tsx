"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { parseOrderNumber } from "@/lib/orders/order-number";
import { cn } from "@/lib/utils";

/**
 * An order number a shopper can actually use: the short code large ("W1WI7P"), the date in
 * words beneath it, and a tap to copy the full number EchoDesk knows it by — for pasting into
 * WhatsApp or an email when they get in touch.
 */
export function OrderNumber({ number, align = "center" }: { number: string; align?: "center" | "start" }) {
  const t = useTranslations("checkout");
  const locale = useLocale();
  const { code, date, full } = parseOrderNumber(number);
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(full);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard blocked (old browser, insecure context): the code stays readable on screen.
    }
  };

  const dateText = date
    ? new Intl.DateTimeFormat(locale === "ka" ? "ka-GE" : "en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(date)
    : null;

  return (
    <div className={cn("flex flex-col gap-0.5", align === "center" ? "items-center text-center" : "items-start")}>
      <span className="text-xs opacity-60">{t("orderNumberLabel")}</span>
      <button
        type="button"
        onClick={copy}
        title={full}
        aria-label={t("copyOrderNumber", { number: full })}
        className="group inline-flex cursor-pointer items-center gap-2 rounded-md px-2 py-0.5 transition-colors hover:bg-black/5"
      >
        <span className="font-display text-2xl tracking-[0.12em] tabular-nums">{code}</span>
        {copied ? (
          <Check size={16} className="text-[var(--color-brand-maroon)]" aria-hidden />
        ) : (
          <Copy size={15} className="opacity-50 group-hover:opacity-90" aria-hidden />
        )}
      </button>
      <span className="text-xs opacity-60" aria-live="polite">
        {copied ? t("orderNumberCopied") : dateText}
      </span>
    </div>
  );
}
