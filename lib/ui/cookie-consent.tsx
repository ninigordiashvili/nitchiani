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
  /** Wording version the visitor answered. Missing = 1, the Google-Analytics-only banner. */
  version?: number;
};

/**
 * Bumped when the banner starts describing something new, so that visitors who answered the old
 * wording are asked again — an answer to a question that did not mention Meta cannot count as
 * consent to Meta. Version 2 is the banner that names the Meta Pixel; it applies exactly when the
 * pixel is switched on, so flipping `NEXT_PUBLIC_META_PIXEL_ENABLED` is what re-asks everyone,
 * once. Anyone answering the new banner is stored at the current version and is not asked again.
 */
export const CONSENT_VERSION = process.env.NEXT_PUBLIC_META_PIXEL_ENABLED === "true" ? 2 : 1;

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
    // An answer to older wording is treated as no answer: nothing optional runs and the banner
    // shows again. The old record is simply overwritten by the new choice.
    if ((parsed.version ?? 1) !== CONSENT_VERSION) return null;
    const age = Date.now() - new Date(parsed.decidedAt).getTime();
    if (age > MAX_AGE_MS) return null;
    return parsed;
  } catch {
    return null;
  }
}

/**
 * The stored decision, read straight from storage rather than from React state — for code that
 * runs outside a component (event handlers, the cart store) and must still honour the banner.
 */
export function hasAnalyticsConsent(): boolean {
  return readStored()?.decision === "accepted";
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
        JSON.stringify({
          decision: d,
          decidedAt: new Date().toISOString(),
          version: CONSENT_VERSION,
        } satisfies StoredConsent),
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
