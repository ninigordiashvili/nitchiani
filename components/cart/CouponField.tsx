"use client";

import { Check, Tag, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { useCart } from "@/lib/cart/store";
import { couponLabel } from "@/lib/cart/coupons";
import type { Locale } from "@/lib/i18n/config";
import { cn } from "@/lib/utils";

/**
 * Promo-code field, always visible. It used to sit behind a "Have a promo code?" disclosure,
 * which kept the surface calm at the cost of hiding the discount from anyone not looking for
 * it — a shopper holding a code had to guess that the row was a control. Applied state shows
 * the active code as a chip with a remove (×) button; errors render inline beneath the input.
 *
 * Used in the cart drawer, cart page, and checkout — same component, same store-backed
 * state, so applying in one surface persists everywhere.
 */
export function CouponField({ tone = "light" }: { tone?: "light" | "dark" } = {}) {
  const t = useTranslations("cart");
  const locale = useLocale() as Locale;
  const cart = useCart();
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
        <div className="flex min-w-0 flex-col gap-0.5">
          <span className="flex min-w-0 items-center gap-2">
            <Check size={14} className="flex-shrink-0" style={{ color: "var(--color-brand-maroon)" }} />
            <span className={cn("text-xs font-medium tabular-nums", labelColor)}>
              {cart.coupon.code}
            </span>
            <span
              className="text-xs font-medium"
              style={{ color: "var(--color-brand-maroon)" }}
            >
              {couponLabel(cart.coupon)}
            </span>
          </span>
          {/* Say plainly that it worked and by how much. The chip alone reads as "a code is
              attached"; shoppers reported not realising the price had actually come down. */}
          {discountAmount > 0 ? (
            <span
              role="status"
              aria-live="polite"
              className="text-[11px]"
              style={{ color: "var(--color-brand-maroon)" }}
            >
              {t("promoCodeApplied", { amount: formatGel(discountAmount, locale) })}
            </span>
          ) : cart.couponShortfall && cart.couponShortfall > 0 ? (
            /* The code is still attached but its condition has lapsed — a pack was removed.
               Saying how many are missing turns a silently dead discount into something the
               shopper can put right in one tap. */
            <span role="status" aria-live="polite" className="text-[11px] opacity-70">
              {t("promoCodeAddMore", { count: cart.couponShortfall })}
            </span>
          ) : cart.coupon.minSubtotal ? (
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

  return <CouponEditor tone={tone} draft={draft} setDraft={setDraft} />;
}

/** The input itself. Kept separate so the field's own state and effects stay readable. */
function CouponEditor({
  tone,
  draft,
  setDraft,
}: {
  tone: "light" | "dark";
  draft: string;
  setDraft: (value: string) => void;
}) {
  const t = useTranslations("cart");
  const locale = useLocale() as Locale;
  const cart = useCart();
  const inputRef = useRef<HTMLInputElement>(null);
  const isDark = tone === "dark";
  const labelColor = isDark
    ? "text-[var(--color-brand-cream)]"
    : "text-[var(--color-brand-ink)]";

  // Deliberately does NOT focus on mount. The field used to be opened by a tap, where taking
  // focus was the point; now that it renders with the page, grabbing focus would scroll the
  // checkout to its summary and raise the keyboard on mobile before the shopper has typed a
  // thing. Only a stale error from a previous surface is cleared.
  useEffect(() => {
    if (cart.couponError) cart.clearCouponError();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Plain handler — no `<form>` wrapper because the CouponField is rendered inside the
  // checkout's outer form and nested forms are invalid HTML (the inner one collapses, and
  // an inner submit button would fire the outer form's onSubmit — i.e. accidentally
  // place the order from the coupon Apply button).
  const apply = async () => {
    const value = draft.trim();
    if (!value) return;
    const ok = await cart.applyCoupon(value);
    if (ok) setDraft("");
  };

  return (
    <div className="mb-4">
      <div className="mb-2">
        <span className={cn("label-eyebrow inline-flex items-center gap-1.5", isDark && labelColor)}>
          <Tag size={12} />
          {t("promoCode")}
        </span>
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
              // Nothing to close any more, so Escape clears what was typed — and is stopped
              // from bubbling, or it would shut the cart drawer this field sits inside.
              e.preventDefault();
              e.stopPropagation();
              setDraft("");
              cart.clearCouponError();
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
          {/* Localised from a reason key, never the backend's English sentence — on the
              Georgian site an English rejection is worse than a vague Georgian one. The
              minimum case names the actual threshold when we know it. */}
          {cart.couponError === "minimum" && cart.couponMinSubtotal
            ? t("promoCodeMinimum", { amount: formatGel(cart.couponMinSubtotal, locale) })
            : cart.couponError === "unavailable"
              ? // Couldn't reach the backend — not the same as a bad code, so don't tell the
                // shopper their coupon is invalid when we simply don't know.
                t("promoCodeUnavailable")
              : cart.couponReason && cart.couponReason !== "unknown"
                ? t(`promoReason.${cart.couponReason}` as never)
                : t("promoCodeInvalid")}
        </p>
      ) : null}
    </div>
  );
}

function formatGel(amount: number, locale: Locale): string {
  const localeMap: Record<Locale, string> = { ka: "ka-GE", en: "en-US" };
  // Always two decimals: the totals row renders "−₾8.90" via the shared money formatter, and
  // a bare `toLocaleString` gave "₾8.9" — the same discount printed two ways, inches apart.
  return `₾${amount.toLocaleString(localeMap[locale], {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}
