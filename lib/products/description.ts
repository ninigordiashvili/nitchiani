/**
 * Turns a product description into blocks the PDP can render.
 *
 * EchoDesk stores the description as plain text in a textarea. The storefront used to drop it
 * into a single `<p>`, which collapses every newline — so a merchant who typed a spec list got
 * one run-on paragraph, and the only way to get a list was to not have one.
 *
 * Lines opening with `-`, `–`, `—`, `*` or `•` become list items; everything else stays a
 * paragraph. Nothing is inferred beyond that: a line is a bullet because it was written as
 * one, not because it happens to contain a colon. Guessing would turn ordinary prose that
 * mentions "Note: ..." into a stray bullet, and a merchant cannot debug a heuristic.
 */
export type DescriptionBlock =
  | { kind: "paragraph"; text: string }
  | { kind: "list"; items: string[] };

const BULLET = /^\s*[-–—*•]\s+/;

export function parseDescription(raw: string | undefined | null): DescriptionBlock[] {
  if (!raw?.trim()) return [];

  const blocks: DescriptionBlock[] = [];
  let paragraph: string[] = [];
  let items: string[] = [];

  const flushParagraph = () => {
    if (paragraph.length === 0) return;
    blocks.push({ kind: "paragraph", text: paragraph.join(" ").trim() });
    paragraph = [];
  };
  const flushList = () => {
    if (items.length === 0) return;
    blocks.push({ kind: "list", items });
    items = [];
  };

  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();

    if (!trimmed) {
      // A blank line ends whichever block is open — that is what the merchant meant by
      // pressing Enter twice.
      flushList();
      flushParagraph();
      continue;
    }

    if (BULLET.test(trimmed)) {
      flushParagraph();
      items.push(trimmed.replace(BULLET, "").trim());
      continue;
    }

    flushList();
    // Soft-wrapped prose rejoins with a space; a textarea wraps where the box ends, not
    // where the sentence does.
    paragraph.push(trimmed);
  }

  flushList();
  flushParagraph();
  return blocks;
}
