"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { DescriptionBlocks } from "./DescriptionBlocks";

/**
 * Roughly the number of characters that fills three lines on a phone — enough to decide, before
 * the browser has measured anything, whether this text will need its "read more".
 */
const CLAMPS_AT = 150;

/**
 * What the product says for itself, between the title and the price.
 *
 * On a phone it is capped at about three lines: at full length it stands twice as tall as the
 * spec bullets it replaced, and every line of it pushes Add to bag further down the first
 * screen. From `sm` up there is room, so it shows whole and the control disappears.
 *
 * Capped by height rather than `line-clamp`, because this is a description — paragraphs and
 * the merchant's own bullet list — and `line-clamp` would have to turn the list into a
 * `-webkit-box` to count its lines, which stops it rendering as a list at all.
 *
 * The rest is a tap away rather than gone: a cut with no way past it would simply lose it.
 */
export function ProductLead({ text }: { text: string }) {
  const t = useTranslations("nav");
  const ref = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState(false);
  /**
   * Whether the cap actually cuts anything off — a short description needs no control.
   *
   * Guessed from the length first so the control is there in the server's markup, and the
   * measurement below only corrects it. Starting at `false` meant the button appeared a moment
   * after the page did and nudged the price down with it.
   */
  const [overflows, setOverflows] = useState(text.length > CLAMPS_AT);

  useEffect(() => {
    const el = ref.current;
    // Measured only while collapsed: expanded, nothing overflows by definition, and asking
    // then would retract the control that got us here.
    if (!el || expanded) return;
    const check = () => setOverflows(el.scrollHeight > el.clientHeight + 1);
    check();
    const observer = new ResizeObserver(check);
    observer.observe(el);
    return () => observer.disconnect();
  }, [text, expanded]);

  return (
    <div className="mt-4">
      <div
        ref={ref}
        className={cn(
          "overflow-hidden sm:max-h-none sm:[mask-image:none]",
          // The fade says the text carries on, so the cut doesn't read as the end of it.
          expanded
            ? null
            : "max-h-[4.25rem] [mask-image:linear-gradient(to_bottom,black_calc(100%-1.25rem),transparent)]",
        )}
      >
        <DescriptionBlocks text={text} />
      </div>
      {overflows ? (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          className="mt-1 cursor-pointer text-xs font-medium underline underline-offset-4 opacity-70 hover:opacity-100 sm:hidden"
        >
          {expanded ? t("readLess") : t("readMore")}
        </button>
      ) : null}
    </div>
  );
}
