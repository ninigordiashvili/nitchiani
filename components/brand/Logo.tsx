import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * Brand logo. Three presentations:
 *
 *   variant="text"     — Latin "NITCHIANI" set in Tenor Sans with editorial tracking.
 *                        Used in the header — small footprint, reads clearly at 14-16px.
 *                        Pass `tone="cream"` for use on the dark footer surface.
 *
 *   variant="mark"     — circular brand stamp (square 1:1, "NITCHIANI .SHOP" on a cream disc,
 *                        transparent outside the circle). Reads on dark surfaces; on a light
 *                        one the disc edge all but disappears. Used in the footer + as the
 *                        favicon (app/icon.png).
 *
 *   variant="wordmark" — vertical Mkhedruli wordmark only (transparent background, maroon glyphs).
 *                        Reserved for hero/splash placements where the column has room to breathe.
 *
 * The accessible name is always "Nitchiani" regardless of variant.
 */
export function Logo({
  variant = "text",
  size = 40,
  tone = "ink",
  className,
  priority = false,
}: {
  variant?: "text" | "mark" | "wordmark";
  /** Pixel height (image variants). Ignored for text variant. */
  size?: number;
  /** Color of the text variant; ignored for image variants. */
  tone?: "ink" | "cream";
  className?: string;
  /** Only for a logo above the fold. The footer's is not, and preloading it there competed
   *  with the product images a shopper actually sees first. */
  priority?: boolean;
}) {
  if (variant === "text") {
    return (
      <span
        className={cn(
          "font-display text-base tracking-[0.32em] uppercase",
          tone === "cream"
            ? "text-[var(--color-brand-cream)]"
            : "text-[var(--color-brand-ink)]",
          className,
        )}
      >
        Nitchiani
      </span>
    );
  }

  if (variant === "wordmark") {
    // Source asset is 192 × 1280 (aspect ≈ 0.15 — vertical column).
    const width = Math.round(size * (192 / 1280));
    return (
      <Image
        src="/brand/wordmark.png"
        alt="Nitchiani"
        width={width}
        height={size}
        className={cn("block", className)}
        priority={priority}
      />
    );
  }

  // Mark — square circular stamp.
  return (
    <Image
      src="/brand/mark.png"
      alt="Nitchiani"
      width={size}
      height={size}
      className={cn("block rounded-full", className)}
      priority={priority}
    />
  );
}

/**
 * @deprecated Use <Logo variant="mark" /> instead. Kept temporarily for any stale imports.
 */
export function LogoMark({ className, size = 32 }: { className?: string; size?: number }) {
  return <Logo variant="mark" size={size} className={className} />;
}
