"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Single-section accordion used on the PDP to collapse secondary details (How to use,
 * What's inside) behind expandable headers. Description stays plain since it's the
 * primary product copy and shouldn't require a tap to read.
 *
 * Hairline-divider styling: each accordion has a `border-b` that the `last:border-b-0`
 * suppresses on the final one. Stack two of these inside a `border-t` container to get
 * the editorial divider rhythm (top + between + no bottom).
 */
export function ProductAccordion({
  title,
  defaultOpen = false,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-black/10 last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full cursor-pointer items-center justify-between py-4 text-left"
      >
        <span className="label-eyebrow">{title}</span>
        <ChevronDown
          size={16}
          className={cn(
            "flex-shrink-0 opacity-60 transition-transform duration-200",
            open && "rotate-180",
          )}
        />
      </button>
      {open ? <div className="pb-4">{children}</div> : null}
    </div>
  );
}
