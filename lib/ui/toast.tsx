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

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<ToastState>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const nextId = useRef(0);

  const show = useCallback((message: string, tone: ToastTone = "ink") => {
    if (timer.current) clearTimeout(timer.current);
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
        // Centred at every width, and sat above the mobile BottomNav. Centring keeps it clear
        // of the chat launcher too — that lives in the bottom-right corner, so the middle of
        // the viewport is the one place nothing else occupies.
        className="pointer-events-none fixed inset-x-0 z-[60] flex justify-center px-4"
        style={{ bottom: "calc(5.5rem + env(safe-area-inset-bottom))" }}
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
