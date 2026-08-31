"use client";

import { Check, ChevronDown } from "lucide-react";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Branded single-choice dropdown.
 *
 * A native `<select>` renders its option list through the OS, so none of the brand
 * surface/typography reaches it — on macOS it draws a system-blue checkmark panel in the
 * system font, which is what this replaces. This is a real listbox (button + popup) so the
 * whole control sits on `--surface-elevated` with the same hairline + shadow as
 * `LocaleSwitcher` and the `PhoneInput` country picker.
 *
 * Keyboard model follows the ARIA listbox pattern:
 *   ↑/↓        move the active option (opens the popup first if closed)
 *   Home/End   jump to first/last
 *   Enter/Space commit the active option
 *   Escape     close without changing the value, focus returns to the trigger
 *   Tab / outside pointer press closes it
 */
export type SelectOption<T extends string> = { value: T; label: string };

export function Select<T extends string>({
  value,
  options,
  onChange,
  label,
  className,
  align = "end",
}: {
  value: T;
  options: readonly SelectOption<T>[];
  onChange: (value: T) => void;
  /** Accessible name for the trigger — rendered by the caller as a visible label. */
  label: string;
  className?: string;
  /** Which edge of the trigger the popup lines up with. */
  align?: "start" | "end";
}) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(() =>
    Math.max(0, options.findIndex((o) => o.value === value)),
  );
  const wrapperRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const listId = useId();

  const selected = options.find((o) => o.value === value) ?? options[0];

  const close = useCallback((focusTrigger = true) => {
    setOpen(false);
    if (focusTrigger) triggerRef.current?.focus();
  }, []);

  const commit = useCallback(
    (index: number) => {
      const opt = options[index];
      if (opt) onChange(opt.value);
      close();
    },
    [options, onChange, close],
  );

  // Re-sync the active row whenever the popup opens, so ↑/↓ starts from the current value
  // rather than from wherever the previous session left off.
  useEffect(() => {
    if (!open) return;
    setActiveIndex(Math.max(0, options.findIndex((o) => o.value === value)));
  }, [open, options, value]);

  // Close on outside press. `pointerdown` (not `click`) so the popup is gone before the
  // page reacts to the press — matches LocaleSwitcher.
  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (!wrapperRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointer);
    return () => document.removeEventListener("pointerdown", onPointer);
  }, [open]);

  // Keep the active option scrolled into view for long lists.
  useEffect(() => {
    if (!open) return;
    const node = listRef.current?.children[activeIndex] as HTMLElement | undefined;
    node?.scrollIntoView({ block: "nearest" });
  }, [open, activeIndex]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case "ArrowDown":
      case "ArrowUp": {
        e.preventDefault();
        if (!open) {
          setOpen(true);
          return;
        }
        const dir = e.key === "ArrowDown" ? 1 : -1;
        setActiveIndex((i) => (i + dir + options.length) % options.length);
        return;
      }
      case "Home":
        if (open) {
          e.preventDefault();
          setActiveIndex(0);
        }
        return;
      case "End":
        if (open) {
          e.preventDefault();
          setActiveIndex(options.length - 1);
        }
        return;
      case "Enter":
      case " ":
        e.preventDefault();
        if (open) commit(activeIndex);
        else setOpen(true);
        return;
      case "Escape":
        if (open) {
          e.preventDefault();
          close();
        }
        return;
      case "Tab":
        if (open) setOpen(false);
        return;
      default:
    }
  };

  return (
    <div ref={wrapperRef} className={cn("relative", className)}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        onKeyDown={onKeyDown}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-label={`${label}: ${selected?.label ?? ""}`}
        className={cn(
          "inline-flex cursor-pointer items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs transition-colors",
          "border-black/15 hover:border-black/40",
          open && "border-[var(--text-primary)]",
        )}
      >
        <span>{selected?.label}</span>
        <ChevronDown
          size={12}
          className={cn(
            "opacity-50 transition-transform duration-200",
            open && "rotate-180",
          )}
        />
      </button>

      {open ? (
        <ul
          ref={listRef}
          id={listId}
          role="listbox"
          aria-label={label}
          aria-activedescendant={`${listId}-${activeIndex}`}
          tabIndex={-1}
          onKeyDown={onKeyDown}
          className={cn(
            "absolute top-full z-50 mt-2 max-h-72 min-w-full overflow-y-auto rounded-lg py-1 whitespace-nowrap",
            align === "end" ? "right-0" : "left-0",
          )}
          style={{
            background: "var(--surface-elevated)",
            boxShadow: "0 4px 24px var(--border-soft), 0 0 0 1px var(--border-soft)",
          }}
        >
          {options.map((opt, i) => {
            const isSelected = opt.value === value;
            return (
              <li key={opt.value} id={`${listId}-${i}`} role="none">
                <button
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => commit(i)}
                  onPointerMove={() => setActiveIndex(i)}
                  className={cn(
                    "flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-left text-xs transition-colors",
                    i === activeIndex && "bg-black/5",
                  )}
                >
                  <Check
                    size={12}
                    className={cn(
                      "flex-shrink-0",
                      isSelected ? "opacity-70" : "opacity-0",
                    )}
                  />
                  <span className={cn("flex-1", isSelected && "font-medium")}>
                    {opt.label}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
