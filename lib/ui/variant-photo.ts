"use client";

import { useSyncExternalStore } from "react";

/**
 * Keeps the variant picker and the gallery beside it looking at the same thing, in both
 * directions: choosing a colour brings up its photo, and reaching that photo by swiping or by
 * the arrows selects the colour.
 *
 * They are not nested: on the PDP they are siblings with the title, the rating and the spec
 * list between them, all server-rendered, so a prop can't cross that gap. A module store does,
 * with no provider to thread through two different surfaces — the PDP and the quick-view sheet
 * both read it the same way. Same pattern as `lib/cart/sold-out.ts`.
 *
 * Only URLs travel. Each side ignores a URL it doesn't recognise, which is what keeps a quick
 * view opened over a product page from disturbing the page behind it, and what makes the two
 * directions settle rather than chase each other: by the time either side reacts, it is
 * already showing what the other asked for, so nothing further changes.
 */

/** Picker → gallery: the photo of the chosen variant. Null when it has none of its own. */
let chosen: string | null = null;
/** Gallery → picker: the photo the shopper is actually looking at. */
let onScreen: string | null = null;

const listeners = new Set<() => void>();

function announce() {
  for (const listener of listeners) listener();
}

export function showVariantPhoto(next: string | null): void {
  if (next === chosen) return;
  chosen = next;
  announce();
}

export function showPhotoOnScreen(next: string | null): void {
  if (next === onScreen) return;
  onScreen = next;
  announce();
}

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  return () => void listeners.delete(onChange);
}

const getChosen = () => chosen;
const getOnScreen = () => onScreen;
const getServerSnapshot = () => null;

/** For a gallery: the photo to show, when the chosen variant has one. */
export function useVariantPhoto(): string | null {
  return useSyncExternalStore(subscribe, getChosen, getServerSnapshot);
}

/** For a picker: the photo on screen, which may belong to a variant it should select. */
export function usePhotoOnScreen(): string | null {
  return useSyncExternalStore(subscribe, getOnScreen, getServerSnapshot);
}
