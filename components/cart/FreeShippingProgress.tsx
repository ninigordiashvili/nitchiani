"use client";

import { Check, Truck } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import type { Locale } from "@/lib/i18n/config";
import { formatPrice } from "@/lib/money";
import type { Money } from "@/lib/shopify/types";

/**
 * Slim progress bar shown above the cart subtotal. Two states:
 *  - Below threshold → "Add ₾X more for free shipping" + partial bar
 *  - At/above threshold → "You unlocked free shipping" + full bar with check icon
 *
 * `threshold` comes from the tenant's shipping method rather than a constant here, so the bar
 * counts towards the number the shop will actually honour. Null — no method, or one with no
 * threshold — renders nothing: a bar promising free delivery the shop hasn't configured is
 * worse than no bar.
 *
 * The cart's transaction currency is always GEL (see `lib/cart/store.tsx`) so the comparison
 * stays in GEL even if the display layer is converting to USD elsewhere.
 */
export function FreeShippingProgress({
  subtotal,
  threshold,
}: {
  subtotal: Money;
  threshold: number | null;
}) {
  const t = useTranslations("cart");
  const locale = useLocale() as Locale;

  // After the hooks: bailing before them would change the hook order between renders.
  if (threshold === null) return null;
  if (subtotal.currencyCode !== "GEL") return null;

  const amount = Number.parseFloat(subtotal.amount);
  if (Number.isNaN(amount)) return null;

  const reached = amount >= threshold;
  const remaining = Math.max(0, threshold - amount);
  const pct = Math.min(100, (amount / threshold) * 100);

  return (
    <div className="mb-4">
      <div className="mb-2 flex items-center gap-2 text-xs">
        {reached ? (
          <>
            <Check
              size={14}
              className="flex-shrink-0"
              style={{ color: "var(--color-brand-maroon)" }}
            />
            <span className="font-medium">{t("freeShippingUnlocked")}</span>
          </>
        ) : (
          <>
            <Truck size={14} className="flex-shrink-0 opacity-70" />
            <span>
              {t("freeShippingRemaining", {
                amount: formatPrice(
                  { amount: remaining.toFixed(2), currencyCode: "GEL" },
                  locale,
                ),
              })}
            </span>
          </>
        )}
      </div>
      <div
        className="h-1 w-full overflow-hidden rounded-full"
        style={{ background: "rgba(13,13,13,0.08)" }}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(pct)}
      >
        <div
          className="h-full"
          style={{
            width: `${pct}%`,
            background: "var(--color-brand-maroon)",
            transition: "width 0.5s var(--ease-brand)",
          }}
        />
      </div>
    </div>
  );
}
