"use client";

import { ChevronDown, Tag, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
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

  return <CouponEditor tone={tone} draft={draft} setDraft={setDraft} onClose={() => setOpen(false)} />;
}

/**
 * Active editor — extracted so the autofocus + escape handlers only mount when actually open,
 * which keeps the cleanup logic predictable.
 */
function CouponEditor({
  tone,
  draft,
  setDraft,
  onClose,
}: {
  tone: "light" | "dark";
  draft: string;
  setDraft: (value: string) => void;
  onClose: () => void;
}) {
  const t = useTranslations("cart");
  const cart = useCart();
  const inputRef = useRef<HTMLInputElement>(null);
  const isDark = tone === "dark";
  const labelColor = isDark
    ? "text-[var(--color-brand-cream)]"
    : "text-[var(--color-brand-ink)]";

  // Focus the input on mount and clear any stale error from a previous open/close cycle so
  // the user doesn't reopen the field to an error they've already mentally moved past.
  useEffect(() => {
    inputRef.current?.focus();
    if (cart.couponError) cart.clearCouponError();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const close = () => {
    setDraft("");
    cart.clearCouponError();
    onClose();
  };

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
      <div className="mb-2 flex items-center justify-between">
        <span className={cn("label-eyebrow inline-flex items-center gap-1.5", isDark && labelColor)}>
          <Tag size={12} />
          {t("promoCode")}
        </span>
        <button
          type="button"
          onClick={close}
          aria-label={t("close")}
          className={cn(
            "-mr-1 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full opacity-50 transition-opacity hover:opacity-100",
            isDark ? "text-[var(--color-brand-cream)]" : "text-[var(--color-brand-ink)]",
          )}
        >
          <X size={14} />
        </button>
      </div>
      <div
        className={cn(
          "flex items-stretch overflow-hidden rounded-md border transition-colors focus-within:border-[var(--color-brand-ink)]",
          isDark ? "border-white/20 bg-white/5" : "border-black/15 bg-white/60",
        )}
      >
        <input
          ref={inputRef}
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              e.stopPropagation();
              apply();
            } else if (e.key === "Escape") {
              e.preventDefault();
              e.stopPropagation();
              close();
            }
          }}
          placeholder={t("promoCodePlaceholder")}
          aria-label={t("promoCode")}
          autoCapitalize="characters"
          autoComplete="off"
          spellCheck={false}
          className={cn(
            "min-w-0 flex-1 bg-transparent px-3 py-2.5 text-sm uppercase tracking-wider tabular-nums focus:outline-none",
            isDark
              ? "text-[var(--color-brand-cream)] placeholder:text-white/40"
              : "placeholder:text-black/30",
          )}
        />
        <button
          type="button"
          onClick={apply}
          disabled={draft.trim().length === 0}
          className={cn(
            "label-eyebrow flex-shrink-0 border-l px-4 transition-colors disabled:cursor-not-allowed disabled:opacity-30",
            isDark
              ? "border-white/15 text-[var(--color-brand-cream)] hover:bg-white/10"
              : "border-black/10 text-[var(--color-brand-ink)] hover:bg-black/5",
          )}
          style={isDark ? undefined : { color: "var(--color-brand-ink)" }}
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
