"use client";

import { useTranslations } from "next-intl";
import { useWishlist } from "@/lib/wishlist/store";
import { cn } from "@/lib/utils";

/**
 * Heart toggle button. Sits on top of a ProductCard's image (the parent Link covers the rest of
 * the card), so we stop event propagation + prevent default to swallow the navigation when the
 * user taps the heart.
 *
 * Filled = saved · Outline = not saved. Color stays maroon either way; fill state communicates.
 */
export function WishlistButton({
  handle,
  size = 18,
  className,
}: {
  handle: string;
  size?: number;
  className?: string;
}) {
  const t = useTranslations("wishlist");
  const wishlist = useWishlist();
  const saved = wishlist.has(handle);

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        wishlist.toggle(handle);
      }}
      aria-label={saved ? t("removeAria") : t("addAria")}
      aria-pressed={saved}
      className={cn(
        "flex h-9 w-9 cursor-pointer items-center justify-center rounded-full backdrop-blur-sm transition-colors",
        "bg-[var(--color-brand-cream)]/80 hover:bg-[var(--color-brand-cream)]",
        className,
      )}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill={saved ? "var(--color-brand-maroon)" : "none"}
        stroke="var(--color-brand-maroon)"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    </button>
  );
}
