"use client";

import { useState, type CSSProperties } from "react";
import { useTranslations } from "next-intl";
import { useWishlist } from "@/lib/wishlist/store";
import { cn } from "@/lib/utils";

/**
 * Heart toggle button. Sits on top of a ProductCard's image (the parent Link covers the rest of
 * the card), so we stop event propagation + prevent default to swallow the navigation when the
 * user taps the heart.
 *
 * Filled = saved · Outline = not saved. Color stays maroon either way; fill state communicates.
 *
 * On *add* (unsaved → saved) the heart pops with a soft scale curve and a small radial burst
 * of maroon dots fires from the centre. Remove is silent — the celebration is for the moment
 * the user just earned. `burstKey` increments on every add so the dot animations restart
 * cleanly via React's mount/unmount cycle.
 */
const BURST_DEGREES = [0, 60, 120, 180, 240, 300];

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
  const [burstKey, setBurstKey] = useState(0);

  const onClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const wasSaved = wishlist.has(handle);
    wishlist.toggle(handle);
    if (!wasSaved) setBurstKey((k) => k + 1);
  };

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={saved ? t("removeAria") : t("addAria")}
      aria-pressed={saved}
      className={cn(
        "wishlist-btn relative flex h-9 w-9 cursor-pointer items-center justify-center rounded-full backdrop-blur-sm transition-colors",
        className,
      )}
    >
      {burstKey > 0 ? (
        <span
          key={`burst-${burstKey}`}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
        >
          {BURST_DEGREES.map((deg) => (
            <span
              key={deg}
              className="burst-dot"
              style={{ "--burst-deg": `${deg}deg` } as CSSProperties}
            />
          ))}
        </span>
      ) : null}
      <svg
        key={`heart-${burstKey}`}
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill={saved ? "var(--color-brand-maroon)" : "none"}
        stroke="var(--color-brand-maroon)"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        style={burstKey > 0 ? { animation: "count-pop 0.45s var(--ease-brand)" } : undefined}
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    </button>
  );
}
