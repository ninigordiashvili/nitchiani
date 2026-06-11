"use client";

import { useRef, useState, type TouchEvent } from "react";

type Direction = "left" | "right" | "up" | "down";

/**
 * Touch-gesture helpers for dismissing a drawer/sheet by swiping toward its closing edge.
 * Returns `dragOffset` in pixels (signed in the dismiss direction — positive for
 * `right`/`down`, negative for `left`/`up`) and the touch handlers to spread on the element.
 *
 * Caller wires up the live transform during drag (overriding any CSS transition) and lets
 * the natural transition kick back in when the user releases short of the threshold.
 *
 * `direction` = the axis-aligned direction the user must swipe to dismiss:
 *   "right" → right-anchored drawer (cart)
 *   "left"  → left-anchored drawer (mobile menu)
 *   "down"  → bottom sheet dismissing downward (slide-up modals)
 *   "up"    → top overlay dismissing upward (search overlay)
 *
 * `threshold` defaults to 0.3 — drag must exceed 30% of the element's size on the relevant
 * axis to trigger dismissal. Anything short snaps back via the element's existing transition.
 *
 * For vertical directions ("down" / "up"), the hook gates on the element's scroll position
 * so internal content scrolling wins when the user is mid-content. Dismiss only engages at
 * the natural starting edge (top of scroll for "down", bottom for "up").
 *
 * `maxViewportWidth` — when set, the hook stays disarmed for viewports at or above this
 * width. Use 640 for modals that switch from a slide-up sheet on mobile to a centred
 * overlay on tablet/desktop (where a vertical drag would push the centred modal off-axis).
 */
export function useSwipeDismiss({
  direction,
  onDismiss,
  threshold = 0.3,
  maxViewportWidth,
}: {
  direction: Direction;
  onDismiss: () => void;
  threshold?: number;
  maxViewportWidth?: number;
}) {
  const [dragOffset, setDragOffset] = useState(0);
  const startRef = useRef(0);
  const sizeRef = useRef(0);
  const armedRef = useRef(true);

  const horizontal = direction === "left" || direction === "right";
  const positive = direction === "right" || direction === "down";

  const onTouchStart = (e: TouchEvent<HTMLElement>) => {
    armedRef.current = true;

    // Viewport gate — skip on tablet/desktop where the modal centres rather than slides.
    if (
      maxViewportWidth !== undefined &&
      typeof window !== "undefined" &&
      window.innerWidth >= maxViewportWidth
    ) {
      armedRef.current = false;
      return;
    }

    const el = e.currentTarget;

    // Scroll-position gate — if the user is mid-scroll inside the element, treat the
    // vertical drag as a scroll, not a dismiss. Horizontal drawers don't need this.
    if (direction === "down" && el.scrollTop > 0) {
      armedRef.current = false;
      return;
    }
    if (
      direction === "up" &&
      el.scrollTop + el.clientHeight < el.scrollHeight
    ) {
      armedRef.current = false;
      return;
    }

    const t = e.touches[0];
    startRef.current = horizontal ? t.clientX : t.clientY;
    sizeRef.current = horizontal ? el.offsetWidth : el.offsetHeight;
  };

  const onTouchMove = (e: TouchEvent<HTMLElement>) => {
    if (!armedRef.current) return;
    const t = e.touches[0];
    const current = horizontal ? t.clientX : t.clientY;
    const raw = current - startRef.current;
    // Only respond to drag in the dismiss direction — opposing pulls do nothing, so a
    // slight back-tug doesn't drift the drawer past its rest position.
    const delta = positive ? Math.max(0, raw) : Math.min(0, raw);
    setDragOffset(delta);
  };

  const onTouchEnd = () => {
    if (!armedRef.current) {
      setDragOffset(0);
      return;
    }
    const size = sizeRef.current || 1;
    if (Math.abs(dragOffset) / size > threshold) {
      onDismiss();
    }
    setDragOffset(0);
  };

  const onTouchCancel = () => setDragOffset(0);

  return {
    dragOffset,
    handlers: { onTouchStart, onTouchMove, onTouchEnd, onTouchCancel },
  };
}
