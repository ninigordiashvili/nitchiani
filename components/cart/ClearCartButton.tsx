"use client";

import { Trash2 } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslations } from "next-intl";
import { useCart } from "@/lib/cart/store";
import { useFocusTrap } from "@/lib/ui/use-focus-trap";
import { cn } from "@/lib/utils";

/**
 * "Clear cart" with a centred confirmation dialog.
 *
 * The confirm used to be an inline "Sure? · Yes · No" swapped into the same 11px row, which
 * was easy to miss entirely and easy to mis-tap next to the drawer's close button — a bad
 * combination for the one irreversible action in the cart. A modal makes the choice
 * unmissable and puts real tap targets under both answers.
 *
 * `contained` decides where it centres. The drawer passes it so the dialog sits in the
 * middle of the cart panel rather than the middle of the screen: its `<aside>` is already
 * `position: absolute`, so an `absolute inset-0` overlay resolves to the panel's own box,
 * and nothing between the two clips or re-positions it.
 *
 * Without it — the `/cart` page — there is no such box to sit inside, so the dialog stays
 * viewport-centred and goes through a portal to `document.body`. That keeps it clear of any
 * ancestor's stacking context and, on the page, out of a containing block that could anchor
 * it far above the fold on a long cart.
 *
 * Renders nothing when the cart is already empty.
 */
export function ClearCartButton({
  tone = "light",
  contained = false,
}: {
  tone?: "light" | "dark";
  /** Centre inside the nearest positioned ancestor instead of the viewport. */
  contained?: boolean;
} = {}) {
  const t = useTranslations("cart");
  const cart = useCart();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const isDark = tone === "dark";

  useFocusTrap(dialogRef, open);

  // Portals need a DOM to target, so hold off until after hydration.
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        setOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  // Nothing left to clear — also covers the moment right after confirming.
  useEffect(() => {
    if (cart.lines.length === 0) setOpen(false);
  }, [cart.lines.length]);

  if (cart.lines.length === 0) return null;

  const dialog = (
    <div
      className={cn(
        "z-[60] flex items-center justify-center p-4",
        contained ? "absolute inset-0" : "fixed inset-0",
      )}
      role="presentation"
    >
      <div
        className="absolute inset-0"
        style={{ background: "rgba(10,31,31,0.55)" }}
        onClick={() => setOpen(false)}
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative w-[min(340px,100%)] rounded-2xl p-6 text-center"
        style={{
          background: "var(--surface)",
          boxShadow: "0 16px 48px rgba(10,31,31,0.28)",
        }}
      >
        <span
          className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-full"
          style={{
            background:
              "color-mix(in oklab, var(--color-brand-maroon) 12%, transparent)",
            color: "var(--color-brand-maroon)",
          }}
        >
          <Trash2 size={18} />
        </span>

        <p id={titleId} className="font-display text-xl leading-tight">
          {t("clearCartConfirm")}
        </p>
        <p className="mt-2 text-sm opacity-70">{t("clearCartConfirmDesc")}</p>

        {/* Cancel sits first so the safe choice is the one under the thumb on the
            left-to-right sweep, and it takes focus first from the trap. */}
        <div className="mt-6 flex gap-2">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="btn-ghost flex-1 px-3 py-2.5 text-xs"
          >
            {t("clearCartCancel")}
          </button>
          <button
            type="button"
            onClick={() => {
              cart.clear();
              setOpen(false);
            }}
            className="btn-primary flex-1 px-3 py-2.5 text-xs"
            style={{
              background: "var(--color-brand-maroon)",
              color: "var(--color-brand-cream)",
            }}
          >
            {t("clearCartYes")}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
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

      {open
        ? contained
          ? dialog
          : mounted
            ? createPortal(dialog, document.body)
            : null
        : null}
    </>
  );
}
