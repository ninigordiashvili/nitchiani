"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

/**
 * Roughly the number of characters that fills three lines on a phone — enough to decide, before
 * the browser has measured anything, whether this paragraph will need its "read more".
 */
const CLAMPS_AT = 150;

/**
 * The merchant's short description, above the price.
 *
 * On a phone it is capped at three lines: at full length it is about twice the height of the
 * spec bullets it replaced, and every line of it pushes Add to bag further down the first
 * screen. From `sm` up there is room, so it shows whole and the control disappears.
 *
 * The rest is a tap away rather than gone — this text lives nowhere else on the page, so a
 * clamp with no way past it would simply lose it.
 */
export function ShortDescription({ text }: { text: string }) {
  const t = useTranslations("nav");
  const ref = useRef<HTMLParagraphElement>(null);
  const [expanded, setExpanded] = useState(false);
  /**
   * Whether three lines actually cut anything off — a short paragraph needs no control.
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
      <p
        ref={ref}
        className={cn(
          "max-w-prose text-sm leading-relaxed opacity-85",
          expanded ? null : "line-clamp-3 sm:line-clamp-none",
        )}
      >
        {text}
      </p>
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
