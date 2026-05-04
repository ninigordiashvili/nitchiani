import { cn } from "@/lib/utils";

/**
 * Inline SVG star row. Renders full / half / empty stars from a numeric value (0–5).
 * No font dependency, scales by `size` (px). Used inline next to prices and review counts.
 */
export function StarRating({
  value,
  size = 14,
  className,
}: {
  value: number;
  size?: number;
  className?: string;
}) {
  const clamped = Math.max(0, Math.min(5, value));

  return (
    <span
      className={cn("inline-flex items-center gap-0.5 align-middle", className)}
      role="img"
      aria-label={`${clamped.toFixed(1)} out of 5 stars`}
    >
      {Array.from({ length: 5 }, (_, i) => {
        const fill = Math.max(0, Math.min(1, clamped - i)); // 0, 0.5, 1
        return <Star key={i} size={size} fill={fill} />;
      })}
    </span>
  );
}

function Star({ size, fill }: { size: number; fill: number }) {
  // Use a clipPath with an inline mask so half-stars render as a partial fill.
  const id = `star-clip-${Math.round(fill * 1000)}`;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden="true"
      style={{ flex: "0 0 auto" }}
    >
      <defs>
        <clipPath id={id}>
          <rect x="0" y="0" width={24 * fill} height="24" />
        </clipPath>
      </defs>
      {/* Outline (background) */}
      <path
        d="M12 2.5l2.95 5.98 6.6.96-4.78 4.66 1.13 6.58L12 17.6l-5.9 3.08 1.13-6.58L2.45 9.44l6.6-.96L12 2.5z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      {/* Filled portion via clipPath */}
      {fill > 0 && (
        <path
          d="M12 2.5l2.95 5.98 6.6.96-4.78 4.66 1.13 6.58L12 17.6l-5.9 3.08 1.13-6.58L2.45 9.44l6.6-.96L12 2.5z"
          fill="currentColor"
          clipPath={`url(#${id})`}
        />
      )}
    </svg>
  );
}
