"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * The page's query string (`?sort=…&attr=…`), read in the browser.
 *
 * Next's `useSearchParams` would do the same, but on a page served from cache it makes the
 * whole filtered grid render only in the browser — the cached HTML then has no products in
 * it, which costs both search ranking and the first paint. Reading `location` instead lets
 * listing pages be cached with their full product grid: the server and the first browser
 * render use no filters, and any filters in the URL apply right after.
 *
 * Writes go through `setQuery`, which updates the address bar without a server round trip
 * and notifies every reader; back/forward navigation notifies them too.
 */
const EVENT = "nitchiani:querychange";

function subscribe(onChange: () => void) {
  window.addEventListener("popstate", onChange);
  window.addEventListener(EVENT, onChange);
  return () => {
    window.removeEventListener("popstate", onChange);
    window.removeEventListener(EVENT, onChange);
  };
}

const getSnapshot = () => window.location.search;
const getServerSnapshot = () => "";

export function useUrlQuery(): URLSearchParams {
  const search = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return new URLSearchParams(search);
}

/** Merge `updates` into the query string; null or "" removes a key. Adds a history entry. */
export function useSetUrlQuery() {
  return useCallback((updates: Record<string, string | null>) => {
    const params = new URLSearchParams(window.location.search);
    for (const [key, value] of Object.entries(updates)) {
      if (value === null || value === "") params.delete(key);
      else params.set(key, value);
    }
    const qs = params.toString();
    const url = qs ? `${window.location.pathname}?${qs}` : window.location.pathname;
    window.history.pushState(window.history.state, "", url);
    window.dispatchEvent(new Event(EVENT));
  }, []);
}
