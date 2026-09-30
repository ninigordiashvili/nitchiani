"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

/**
 * A category's intro, folded to its first few lines.
 *
 * Unfolded, a long description pushed the products below the first screen, and the products
 * are what the page is for. Folding keeps them in view and leaves the text one tap away.
 *
 * The full text is always in the HTML — only its height is limited — so search engines read
 * all of it. The toggle appears only when the text actually overflows, which depends on the
 * screen width, so it's measured rather than guessed from the character count.
 *
 * A blank line in the copy starts a new paragraph.
 */
export function CollectionDescription({ text }: { text: string }) {
  const t = useTranslations("nav");
  const ref = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [overflows, setOverflows] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => setOverflows(el.scrollHeight > el.clientHeight + 1);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const paragraphs = text.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  const folded = !open;

  return (
    <div className="mt-2 max-w-prose text-sm opacity-70">
      <div
        ref={ref}
        className={cn("grid gap-2 leading-relaxed", folded && "max-h-[4.9rem] overflow-hidden")}
        // Fade the last visible line so the cut reads as "there's more", not as a clipped box.
        style={
          folded && overflows
            ? { maskImage: "linear-gradient(to bottom, black 55%, transparent)" }
            : undefined
        }
      >
        {paragraphs.map((para, i) => (
          <p key={i}>{para}</p>
        ))}
      </div>
      {overflows || open ? (
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className="mt-1.5 cursor-pointer text-xs font-medium underline underline-offset-2 opacity-90 hover:opacity-100"
        >
          {open ? t("readLess") : t("readMore")}
        </button>
      ) : null}
    </div>
  );
}
