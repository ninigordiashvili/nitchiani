"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * Products this visit has learned are sold out.
 *
 * Listing pages are served from cache for a few minutes, so a product can still look
 * available there after the shopper's own order took the last one — the bag finds out when it
 * re-checks itself, and nothing else on the page knew. Recording it here lets every card and
 * buy button show the truth at once, without waiting for the cache or a reload.
 *
 * Per tab, and only ever added to: it says "this was sold out a moment ago", which the next
 * fresh render from EchoDesk confirms or quietly replaces.
 */
const KEY = "nitchiani:sold-out";
let handles = new Set<string>();
let hydrated = false;
const listeners = new Set<() => void>();
/** Replaced on change, so `useSyncExternalStore` sees a new value and re-renders. */
let snapshot: ReadonlySet<string> = handles;

function load() {
  if (hydrated) return;
  hydrated = true;
  try {
    const raw = sessionStorage.getItem(KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    if (Array.isArray(parsed)) handles = new Set(parsed.filter((h): h is string => typeof h === "string"));
    snapshot = handles;
  } catch {
    // Storage unavailable: the set simply starts empty.
  }
}

export function markSoldOut(productHandles: string[]): void {
  load();
  const next = new Set(handles);
  for (const h of productHandles) if (h) next.add(h);
  if (next.size === handles.size) return;
  handles = next;
  snapshot = handles;
  try {
    sessionStorage.setItem(KEY, JSON.stringify([...handles]));
  } catch {
    // Not persisted; it still holds for this render.
  }
  for (const listener of listeners) listener();
}

function subscribe(onChange: () => void) {
  load();
  listeners.add(onChange);
  return () => void listeners.delete(onChange);
}

const getSnapshot = () => snapshot;
const EMPTY: ReadonlySet<string> = new Set();
const getServerSnapshot = () => EMPTY;

/** `isSoldOut(handle)` — true for a product this visit found sold out. */
export function useSoldOut(): (handle: string) => boolean {
  const known = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return useCallback((handle: string) => known.has(handle), [known]);
}
