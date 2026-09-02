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
type ToastState = { message: string; id: number } | null;

const ToastContext = createContext<{ show: (message: string) => void } | null>(null);

const VISIBLE_MS = 2600;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<ToastState>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const nextId = useRef(0);

  const show = useCallback((message: string) => {
    if (timer.current) clearTimeout(timer.current);
    // A fresh id restarts the entry animation even when the text is identical, so a second
    // add still reads as a new confirmation rather than a stuck message.
    setToast({ message, id: ++nextId.current });
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
        // Fixed above the mobile BottomNav and clear of the chat launcher's corner. Centred
        // on mobile, bottom-left on desktop so it never lands under the launcher.
        className="pointer-events-none fixed inset-x-0 z-[60] flex justify-center px-4 sm:left-6 sm:right-auto sm:justify-start"
        style={{ bottom: "calc(5.5rem + env(safe-area-inset-bottom))" }}
      >
        {toast ? (
          <div
            key={toast.id}
            className="toast-in pointer-events-auto flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium shadow-lg"
            style={{
              background: "var(--color-brand-ink)",
              color: "var(--color-brand-cream)",
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              className="flex-shrink-0"
            >
              <path d="M20 6 9 17l-5-5" />
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
