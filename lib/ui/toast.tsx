"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

/**
 * Minimal toast for confirming an action the user can't otherwise see the result of —
 * adding to the bag from the quick-view sheet, which closes immediately afterwards.
 *
 * Deliberately single-slot: a second message replaces the first rather than stacking. The
 * only thing that raises one today is add-to-bag, and a queue of "added to bag" notices from
 * an impatient double-tap is noise, not information.
 *
 * `role="status"` + `aria-live="polite"` so it's announced without interrupting, and the
 * timer is cleared on unmount so a toast raised just before navigation can't fire into a
 * stale tree.
 */
/**
 * `maroon` is the wishlist's colour, matching the heart itself, so a favourites confirmation
 * reads as belonging to that action rather than to the bag.
 */
export type ToastTone = "ink" | "maroon";

type ToastState = { message: string; id: number; tone: ToastTone } | null;

const ToastContext = createContext<{
  show: (message: string, tone?: ToastTone) => void;
} | null>(null);

const VISIBLE_MS = 2600;

/** Gap between the header's lower edge and the toast. */
const HEADER_GAP = 12;

/**
 * Where the toast should sit, measured when it is raised.
 *
 * A fixed offset can't be right: the header is sticky, so at the top of the page it sits
 * below a promo bar, once scrolled it pins to zero, and scrolling down hides it entirely by
 * translating it off-screen. Reading its actual lower edge covers all three, and the clamp
 * keeps the toast on screen when the header is hidden or missing.
 */
function toastTop(): number {
  if (typeof document === "undefined") return HEADER_GAP;
  const header = document.querySelector("header");
  const bottom = header?.getBoundingClientRect().bottom ?? 0;
  return Math.max(bottom, 0) + HEADER_GAP;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<ToastState>(null);
  const [top, setTop] = useState(HEADER_GAP);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const nextId = useRef(0);

  const show = useCallback((message: string, tone: ToastTone = "ink") => {
    if (timer.current) clearTimeout(timer.current);
    setTop(toastTop());
    // A fresh id restarts the entry animation even when the text is identical, so a second
    // add still reads as a new confirmation rather than a stuck message.
    setToast({ message, id: ++nextId.current, tone });
    timer.current = setTimeout(() => setToast(null), VISIBLE_MS);
  }, []);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const value = useMemo(() => ({ show }), [show]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        role="status"
        aria-live="polite"
        // Top-centred, just under the header, rather than down by the mobile BottomNav.
        // Adding to the bag is something you do from a card in the grid, and a confirmation
        // at the foot of a long page is easy to miss — the eye is where the tap was.
        // `z-[60]` keeps it above the header's `z-40`.
        className="pointer-events-none fixed inset-x-0 z-[60] flex justify-center px-4"
        style={{ top: `calc(${top}px + env(safe-area-inset-top))` }}
      >
        {toast ? (
          <div
            key={toast.id}
            className="toast-in pointer-events-auto flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium shadow-lg"
            style={{
              background:
                toast.tone === "maroon"
                  ? "var(--color-brand-maroon)"
                  : "var(--color-brand-ink)",
              color: "var(--color-brand-cream)",
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill={toast.tone === "maroon" ? "currentColor" : "none"}
              stroke="currentColor"
              strokeWidth={toast.tone === "maroon" ? 1.8 : 2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              className="flex-shrink-0"
            >
              {toast.tone === "maroon" ? (
                // Filled heart — the same shape the button itself just became.
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              ) : (
                <path d="M20 6 9 17l-5-5" />
              )}
            </svg>
            {toast.message}
          </div>
        ) : null}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}
