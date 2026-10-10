import { parseDescription } from "@/lib/products/description";
import { cn } from "@/lib/utils";

/**
 * A product description as the merchant typed it — paragraphs, and the lines they wrote as
 * bullets kept as a list. See `parseDescription`.
 *
 * Shared by the two places a description appears: above the price, where the feature list
 * leads, and in the tab below, where the blurb sits. One renderer so the two can't drift into
 * different type sizes or list markers.
 */
export function DescriptionBlocks({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const blocks = parseDescription(text);
  if (blocks.length === 0) return null;

  return (
    <div className={cn("grid max-w-prose gap-3 text-sm leading-relaxed opacity-85", className)}>
      {blocks.map((b, i) =>
        b.kind === "paragraph" ? (
          <p key={i}>{b.text}</p>
        ) : (
          <ul key={i} className="grid list-disc gap-1.5 pl-5 marker:opacity-45">
            {b.items.map((item, j) => (
              <li key={j}>{item}</li>
            ))}
          </ul>
        ),
      )}
    </div>
  );
}
