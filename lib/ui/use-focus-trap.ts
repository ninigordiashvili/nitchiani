"use client";

import { useEffect, type RefObject } from "react";

/**
 * Focus trap for modals/drawers. When `active` flips true:
 *  - Remembers the element that opened the modal (current `document.activeElement`).
 *  - Moves focus into the modal — first focusable descendant, or the container itself.
 *  - Cycles Tab / Shift+Tab within the modal so focus never escapes to the page beneath.
 *
 * When `active` flips false (or the component unmounts), focus is restored to the
 * originally-focused element so keyboard users land where they were before the modal
 * opened. Standard WCAG modal-dialog pattern.
 *
 * No deps — ~30 lines vs the ~6KB `focus-trap-react`.
 */

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "textarea:not([disabled])",
  "select:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

export function useFocusTrap(
  containerRef: RefObject<HTMLElement | null>,
  active: boolean,
) {
  useEffect(() => {
    if (!active) return;
    const container = containerRef.current;
    if (!container) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;

    // Move focus into the modal. Prefer the first interactive child; if none, focus
    // the container itself (tabindex=-1 makes it programmatically focusable without
    // putting it in the tab order).
    const firstFocusable = container.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
    if (firstFocusable) {
      firstFocusable.focus();
    } else {
      container.tabIndex = -1;
      container.focus();
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      // Re-query each Tab — modals with dynamic content (e.g., async-loaded items) may
      // have a different focusable list later in the session.
      const items = Array.from(
        container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      ).filter((el) => !el.hasAttribute("hidden") && el.offsetParent !== null);
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      const activeEl = document.activeElement as HTMLElement | null;

      if (e.shiftKey && activeEl === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && activeEl === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      // Restore focus on close. Guard against the previously-focused element having
      // been removed from the DOM in the interim (e.g., a route change closed the modal).
      if (previouslyFocused && document.body.contains(previouslyFocused)) {
        previouslyFocused.focus();
      }
    };
  }, [active, containerRef]);
}
