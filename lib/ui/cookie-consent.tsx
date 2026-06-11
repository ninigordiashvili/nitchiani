"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

/**
 * Cookie consent state — kept simple on purpose. Two outcomes the user can pick:
 *   - "accepted"  → all cookies (essential + analytics + marketing) may run
 *   - "rejected"  → only essential cookies (cart/wishlist/locale persistence)
 *
 * Decision persists to localStorage with an ISO timestamp. We treat any decision older
 * than 12 months as expired and re-prompt — matches the convention in most EU/GE rulings.
 *
 * Use `useCookieConsent()` from any client component to:
 *   - check `decision` before loading analytics / marketing tags
 *   - call `setDecision("accepted" | "rejected")` from a "Cookie preferences" link
 *   - call `reset()` to force the banner to re-appear (e.g., from a settings page)
 */

export type CookieDecision = "accepted" | "rejected";

type StoredConsent = {
  decision: CookieDecision;
  decidedAt: string; // ISO timestamp
};

const STORAGE_KEY = "nitchiani:cookie-consent";
const MAX_AGE_MS = 1000 * 60 * 60 * 24 * 365; // 12 months

type CookieConsentContextValue = {
  decision: CookieDecision | null;
  /** True while we haven't yet hydrated from localStorage — components should treat as "unknown". */
  hydrating: boolean;
  setDecision: (d: CookieDecision) => void;
  /** Force the banner to re-appear (clears persisted decision). */
  reset: () => void;
};

const CookieConsentContext = createContext<CookieConsentContextValue | null>(null);

function readStored(): StoredConsent | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredConsent;
    if (parsed.decision !== "accepted" && parsed.decision !== "rejected") return null;
    if (!parsed.decidedAt) return null;
    const age = Date.now() - new Date(parsed.decidedAt).getTime();
    if (age > MAX_AGE_MS) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function CookieConsentProvider({ children }: { children: React.ReactNode }) {
  const [decision, setDecisionState] = useState<CookieDecision | null>(null);
  const [hydrating, setHydrating] = useState(true);

  useEffect(() => {
    const stored = readStored();
    if (stored) setDecisionState(stored.decision);
    setHydrating(false);
  }, []);

  const setDecision = useCallback((d: CookieDecision) => {
    setDecisionState(d);
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ decision: d, decidedAt: new Date().toISOString() }),
      );
    } catch {
      // private mode / quota — best-effort
    }
  }, []);

  const reset = useCallback(() => {
    setDecisionState(null);
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // best-effort
    }
  }, []);

  const value = useMemo(
    () => ({ decision, hydrating, setDecision, reset }),
    [decision, hydrating, setDecision, reset],
  );

  return (
    <CookieConsentContext.Provider value={value}>{children}</CookieConsentContext.Provider>
  );
}

export function useCookieConsent(): CookieConsentContextValue {
  const ctx = useContext(CookieConsentContext);
  if (!ctx) {
    return { decision: null, hydrating: true, setDecision: () => {}, reset: () => {} };
  }
  return ctx;
}
