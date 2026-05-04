"use client";

import { useLocale } from "next-intl";
import type { Money } from "@/lib/shopify/types";
import { formatPrice } from "@/lib/money";
import type { Locale } from "@/lib/i18n/config";
import { useCurrency } from "@/lib/currency/store";
import { cn } from "@/lib/utils";

export function PriceDisplay({
  price,
  compareAt,
  className,
  size = "sm",
}: {
  price: Money;
  compareAt?: Money;
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const locale = useLocale() as Locale;
  const { currency } = useCurrency();
  const sizeClass = size === "lg" ? "text-2xl" : size === "md" ? "text-base" : "text-sm";

  return (
    <span className={cn("flex items-baseline gap-2", className)}>
      <span
        className={cn("font-medium tabular-nums", sizeClass)}
        style={{ color: compareAt ? "var(--color-brand-maroon)" : "var(--color-brand-ink)" }}
      >
        {formatPrice(price, locale, currency)}
      </span>
      {compareAt ? (
        <span className="text-xs line-through opacity-50 tabular-nums">
          {formatPrice(compareAt, locale, currency)}
        </span>
      ) : null}
    </span>
  );
}
