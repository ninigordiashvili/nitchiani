"use client";

import { useSyncExternalStore } from "react";

/**
 * The photo belonging to the variant the shopper has just chosen.
 *
 * The picker and the gallery are not nested: on the PDP they are siblings with the title, the
 * rating and the spec list between them, all server-rendered, so a prop can't cross that gap.
 * A module store does, with no provider to thread through two different surfaces — the PDP and
 * the quick-view sheet both read it the same way. Same pattern as `lib/cart/sold-out.ts`.
 *
 * Only the URL travels: the gallery already holds the shots and matches on `url` to pick which
 * one to show. A gallery therefore ignores a URL that isn't one of its own, which is what keeps
 * a quick view opened over a PDP from disturbing the page behind it.
 */
let url: string | null = null;
const listeners = new Set<() => void>();

/** Null when the chosen variant has no photo of its own — the gallery then stays as it is. */
export function showVariantPhoto(next: string | null): void {
  if (next === url) return;
  url = next;
  for (const listener of listeners) listener();
}

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  return () => void listeners.delete(onChange);
}

const getSnapshot = () => url;
const getServerSnapshot = () => null;

export function useVariantPhoto(): string | null {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
