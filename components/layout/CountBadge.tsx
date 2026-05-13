"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Maroon count chip used by the header and bottom-nav for cart + wishlist counts.
 *
 * Pulses on increment: when `count` goes up, a `key` change remounts the inner span,
 * which re-fires the CSS `count-pop` animation. Decrements (or going to 0 and unmounting
 * the badge) don't pulse — celebrations are for moments the user just earned.
 *
 * Pass `className` for absolute positioning so the badge can sit on different anchors
 * across the header and bottom-nav without duplicating the rest of the styling.
 */
export function CountBadge({ count, className }: { count: number; className?: string }) {
  const [pulseKey, setPulseKey] = useState(0);
  const prev = useRef(count);

  useEffect(() => {
    if (count > prev.current) {
      setPulseKey((k) => k + 1);
    }
    prev.current = count;
  }, [count]);

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
        animation: "count-pop 0.4s var(--ease-brand)",
      }}
    >
      {count}
    </span>
  );
}
