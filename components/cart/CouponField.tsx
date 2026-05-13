"use client";

import { ChevronDown, Tag, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { useCart } from "@/lib/cart/store";
import { couponLabel } from "@/lib/cart/coupons";
import type { Locale } from "@/lib/i18n/config";
import { cn } from "@/lib/utils";

/**
 * Collapsible promo-code field. Idle state is a single "Have a promo code?" row so the
 * surface stays calm; user opens it intentionally. Applied state shows the active code as
 * a chip with a remove (×) button. Errors render inline beneath the input.
 *
 * Used in the cart drawer, cart page, and checkout — same component, same store-backed
 * state, so applying in one surface persists everywhere.
 */
export function CouponField({ tone = "light" }: { tone?: "light" | "dark" } = {}) {
  const t = useTranslations("cart");
  const locale = useLocale() as Locale;
  const cart = useCart();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");

  const isDark = tone === "dark";
  const labelColor = isDark
    ? "text-[var(--color-brand-cream)]"
    : "text-[var(--color-brand-ink)]";

  // Applied state — show the chip regardless of whether the discount is currently effective.
  // If the cart drops below `minSubtotal` the discount goes to 0 but the chip stays so the
  // user knows their code is still attached.
  if (cart.coupon) {
    const discountAmount = Number.parseFloat(cart.discount.amount);
    return (
      <div
        className={cn(
          "mb-4 flex items-center justify-between gap-3 rounded-md border px-3 py-2.5",
          isDark ? "border-white/15 bg-white/5" : "border-black/10",
        )}
      >
        <div className="flex min-w-0 items-center gap-2">
          <Tag size={14} className="flex-shrink-0 opacity-70" />
          <span className={cn("text-xs font-medium tabular-nums", labelColor)}>
            {cart.coupon.code}
          </span>
          <span
            className="text-xs font-medium"
            style={{ color: "var(--color-brand-maroon)" }}
          >
            {couponLabel(cart.coupon)}
          </span>
          {discountAmount === 0 && cart.coupon.minSubtotal ? (
            <span className="truncate text-[11px] opacity-60">
              {t("promoCodeMinimum", {
                amount: formatGel(cart.coupon.minSubtotal, locale),
              })}
            </span>
          ) : null}
        </div>
        <button
          type="button"
          onClick={cart.removeCoupon}
          aria-label={t("removeCode")}
          className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full transition-colors hover:bg-black/5"
        >
          <X size={14} />
        </button>
      </div>
    );
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "mb-4 inline-flex items-center gap-1.5 text-xs underline-offset-2 hover:underline",
          labelColor,
          isDark ? "opacity-80" : "opacity-70",
        )}
      >
        <Tag size={13} />
        {t("havePromoCode")}
        <ChevronDown size={13} />
      </button>
    );
  }

  // Plain handler — no `<form>` wrapper because the CouponField is rendered inside the
  // checkout's outer form and nested forms are invalid HTML (the inner one collapses, and
  // an inner submit button would fire the outer form's onSubmit — i.e. accidentally
  // place the order from the coupon Apply button).
  const apply = () => {
    const value = draft.trim();
    if (!value) return;
    const ok = cart.applyCoupon(value);
    if (ok) setDraft("");
  };

  return (
    <div className="mb-4">
      <div className="flex gap-2">
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              e.stopPropagation();
              apply();
            }
          }}
          placeholder={t("promoCodePlaceholder")}
          aria-label={t("promoCode")}
          autoCapitalize="characters"
          autoComplete="off"
          spellCheck={false}
          className={cn(
            "flex-1 rounded-md border px-3 py-2 text-sm uppercase tracking-wider tabular-nums focus:outline-none",
            isDark
              ? "border-white/15 bg-white/5 text-[var(--color-brand-cream)] focus:border-white/40 placeholder:text-white/40"
              : "border-black/15 bg-white/60 focus:border-[var(--color-brand-ink)] placeholder:text-black/30",
          )}
        />
        <button
          type="button"
          onClick={apply}
          disabled={draft.trim().length === 0}
          className={cn(
            "rounded-md px-4 text-xs font-medium uppercase tracking-wider transition-colors disabled:cursor-not-allowed disabled:opacity-40",
            isDark
              ? "border border-white/40 text-[var(--color-brand-cream)] hover:bg-white/10"
              : "border border-black text-[var(--color-brand-ink)] hover:bg-[var(--color-brand-ink)] hover:text-[var(--color-brand-cream)]",
          )}
        >
          {t("applyCode")}
        </button>
      </div>
      {cart.couponError ? (
        <p
          role="alert"
          aria-live="polite"
          className="mt-1.5 text-xs"
          style={{ color: "var(--color-brand-maroon)" }}
        >
          {cart.couponError === "invalid"
            ? t("promoCodeInvalid")
            : t("promoCodeMinimumGeneric")}
        </p>
      ) : null}
    </div>
  );
}

function formatGel(amount: number, locale: Locale): string {
  const localeMap: Record<Locale, string> = { ka: "ka-GE", en: "en-US" };
  return `₾${amount.toLocaleString(localeMap[locale])}`;
}
