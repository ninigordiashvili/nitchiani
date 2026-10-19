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
 * view opened over a product page from disturbing the page behind it.
 *
 * The two directions keep **separate listener sets**, which is what stops them from driving
 * each other. Sharing one set meant publishing "this photo is on screen" woke the components
 * listening for "this colour was chosen" — their snapshot hadn't changed, but the wake-up was
 * enough to re-run the effect that published it, and React stopped the page with "Maximum
 * update depth exceeded".
 */

/** Picker → gallery: the photo of the chosen variant. Null when it has none of its own. */
let chosen: string | null = null;
const chosenListeners = new Set<() => void>();

/** Gallery → picker: the photo the shopper is actually looking at. */
let onScreen: string | null = null;
const screenListeners = new Set<() => void>();

export function showVariantPhoto(next: string | null): void {
  if (next === chosen) return;
  chosen = next;
  for (const listener of chosenListeners) listener();
}

export function showPhotoOnScreen(next: string | null): void {
  if (next === onScreen) return;
  onScreen = next;
  for (const listener of screenListeners) listener();
}

/** Exported for the test that pins the two sets apart; React reaches it via the hook. */
export function subscribeChosen(onChange: () => void) {
  chosenListeners.add(onChange);
  return () => void chosenListeners.delete(onChange);
}

export function subscribeScreen(onChange: () => void) {
  screenListeners.add(onChange);
  return () => void screenListeners.delete(onChange);
}

const getChosen = () => chosen;
const getOnScreen = () => onScreen;
const getServerSnapshot = () => null;

/** For a gallery: the photo to show, when the chosen variant has one. */
export function useVariantPhoto(): string | null {
  return useSyncExternalStore(subscribeChosen, getChosen, getServerSnapshot);
}

/** For a picker: the photo on screen, which may belong to a variant it should select. */
export function usePhotoOnScreen(): string | null {
  return useSyncExternalStore(subscribeScreen, getOnScreen, getServerSnapshot);
}
