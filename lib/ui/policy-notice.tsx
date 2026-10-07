"use client";

import { useCallback, useEffect, useState } from "react";
import { useCookieConsent } from "./cookie-consent";
import { decidePolicyNotice } from "./policy-notice-state";

/**
 * Tracks whether the visitor has been shown the current version of the Privacy Policy, so
 * section 12's promise — "if we change this policy in a way that materially affects you,
 * we'll notify you by email or by a notice on the Site" — is actually kept.
 *
 * The stored value is the policy's own `PRIVACY_LAST_UPDATED` date, not a boolean: bumping
 * that date in `lib/legal.ts` is what re-shows the notice, and nothing else has to be
 * touched. A visitor who has already seen the current date sees nothing.
 *
 * A first-ever visitor is marked as having seen the current version WITHOUT being shown the
 * notice. They are reading today's policy, so telling them it changed would be false — the
 * notice exists for someone who read an older one. The cookie decision is what distinguishes
 * the two: it is written on the first visit and persists, so its presence means "has been
 * here before". Anyone who cleared their storage reads as new, which is the safe direction to
 * be wrong in: they are shown the current policy either way, just without the "we changed it"
 * framing.
 *
 * `localStorage` can throw (private mode, blocked site data) and every access is guarded.
 * When it is unavailable the notice simply never appears rather than appearing on every page.
 */

const STORAGE_KEY = "nitchiani:policy-seen";

type PolicyNoticeState = {
  /** True only when this visitor has seen an older version and should be told. */
  show: boolean;
  dismiss: () => void;
};

function readSeen(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function writeSeen(version: string) {
  try {
    window.localStorage.setItem(STORAGE_KEY, version);
  } catch {
    // private mode / quota — best-effort, same as the cookie decision
  }
}

export function usePolicyNotice(version: string): PolicyNoticeState {
  const { decision, hydrating } = useCookieConsent();
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Wait for the cookie decision to hydrate: before it does, `decision` is null for
    // everyone and a returning visitor would be misread as new and silently marked seen.
    if (hydrating) return;

    const action = decidePolicyNotice({
      seen: readSeen(),
      version,
      hasPriorVisit: decision !== null,
    });
    if (action === "show") setShow(true);
    if (action === "markSeen") writeSeen(version);
  }, [hydrating, decision, version]);

  const dismiss = useCallback(() => {
    setShow(false);
    writeSeen(version);
  }, [version]);

  return { show, dismiss };
}
