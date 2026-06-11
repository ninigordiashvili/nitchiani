import { cn } from "@/lib/utils";

/**
 * Circular initial-letter monogram used next to review authors. Cheap, real-looking
 * substitute for actual customer avatars — the maroon-on-cream chip + the first letter
 * of the first name gives each reviewer a unique-feeling identity without us needing
 * to host any user-uploaded photos.
 *
 * Falls back to a `?` glyph when the name is empty or whitespace-only.
 */
export function Monogram({
  name,
  size = 32,
  className,
}: {
  name: string;
  size?: number;
  className?: string;
}) {
  const initial = getInitial(name);
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex flex-shrink-0 items-center justify-center rounded-full font-medium tabular-nums uppercase",
        className,
      )}
      style={{
        width: size,
        height: size,
        background: "color-mix(in oklab, var(--color-brand-maroon) 12%, transparent)",
        color: "var(--color-brand-maroon)",
        // Letter scales with the disc, kept readable at small sizes.
        fontSize: Math.round(size * 0.42),
      }}
    >
      {initial}
    </span>
  );
}

function getInitial(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return "?";
  // Use the first code point so Georgian Mkhedruli / multi-byte glyphs render correctly.
  const first = [...trimmed][0] ?? "?";
  return first.toLocaleUpperCase();
}
