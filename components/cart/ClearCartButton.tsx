"use client";

import { Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useCart } from "@/lib/cart/store";
import { cn } from "@/lib/utils";

/**
 * Inline "Clear cart" button with a two-step confirm. Idle state is a small underline-on-hover
 * link with a trash glyph; tapping it swaps the row to "Sure? · Yes · Cancel" inline so the
 * destructive action requires intent without resorting to a `confirm()` dialog. Auto-resets
 * after 4s if the user walks away.
 *
 * Renders nothing when the cart is empty.
 */
export function ClearCartButton({ tone = "light" }: { tone?: "light" | "dark" } = {}) {
  const t = useTranslations("cart");
  const cart = useCart();
  const [confirming, setConfirming] = useState(false);
  const isDark = tone === "dark";

  useEffect(() => {
    if (!confirming) return;
    const id = setTimeout(() => setConfirming(false), 4000);
    return () => clearTimeout(id);
  }, [confirming]);

  if (cart.lines.length === 0) return null;

  if (confirming) {
    return (
      <div className="inline-flex items-center gap-2 text-[11px]">
        <span className={cn("opacity-70", isDark && "text-[var(--color-brand-cream)]")}>
          {t("clearCartConfirm")}
        </span>
        <button
          type="button"
          onClick={() => {
            cart.clear();
            setConfirming(false);
          }}
          className="cursor-pointer font-medium tracking-wider uppercase underline underline-offset-2"
          style={{ color: "var(--color-brand-maroon)" }}
        >
          {t("clearCartYes")}
        </button>
        <span className="opacity-30">·</span>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          className={cn(
            "cursor-pointer opacity-70 hover:opacity-100",
            isDark && "text-[var(--color-brand-cream)]",
          )}
        >
          {t("clearCartCancel")}
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setConfirming(true)}
      className={cn(
        "group inline-flex cursor-pointer items-center gap-1.5 text-[11px] opacity-75 underline-offset-2 transition-all hover:opacity-100 hover:underline",
        isDark
          ? "text-[var(--color-brand-cream)]"
          : "text-[var(--color-brand-ink)] hover:text-[var(--color-brand-maroon)]",
      )}
    >
      <Trash2 size={13} />
      {t("clearCart")}
    </button>
  );
}
