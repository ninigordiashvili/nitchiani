"use client";

import { useBumpOnIncrease } from "@/lib/ui/use-bump-on-increase";
import { cn } from "@/lib/utils";

/**
 * Maroon count chip used by the header and bottom-nav for cart + wishlist counts.
 *
 * The `"pop"` variant pulses on increment: when `count` goes up, a `key` change remounts
 * the span, which re-fires the CSS animation. Decrements (or going to 0 and unmounting the
 * badge) don't pulse — celebrations are for moments the user just earned. The
 * `"pulse"` variant ignores the key entirely; its animation never stops, so it has nothing
 * to replay.
 *
 * `motion="pulse"` is the cart variant: a continuous, very small scale loop that runs the
 * whole time the badge is mounted, so the bag stays quietly alive rather than going still a
 * second after an add. It never moves off its anchor — only the size breathes. `"pop"` stays
 * the default one-shot for the wishlist, where the heart already fires a matching burst.
 *
 * Pass `className` for absolute positioning so the badge can sit on different anchors
 * across the header and bottom-nav without duplicating the rest of the styling.
 */
export function CountBadge({
  count,
  className,
  motion = "pop",
}: {
  count: number;
  className?: string;
  motion?: "pop" | "pulse";
}) {
  const pulseKey = useBumpOnIncrease(count);

  return (
    <span
      key={pulseKey}
      className={cn(
        "absolute flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-semibold",
        className,
      )}
      style={{
        background: "var(--color-brand-maroon)",
        color: "var(--color-brand-cream)",
        animation:
          motion === "pulse"
            ? "cart-pulse 2.4s ease-in-out infinite"
            : "count-pop 0.4s var(--ease-brand)",
      }}
    >
      {count}
    </span>
  );
}
