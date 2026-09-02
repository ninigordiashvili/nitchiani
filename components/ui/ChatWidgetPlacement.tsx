"use client";

import { useEffect } from "react";

/**
 * Retracts the EchoDesk chat launcher while the shopper is scrolling.
 *
 * The vendor parks a 56px launcher in the bottom-right corner. On a product grid that corner
 * belongs to a card's wishlist heart and quick-view "+" — measured overlapping both at 1280px
 * and at 390px. There is no corner that never collides, because the grid tiles the viewport,
 * so rather than moving the launcher we get it out of the way exactly while the shopper is
 * scanning and bring it back the moment they settle or scroll up. Browsing is when the
 * obstruction matters and the launcher doesn't; standing still is when the reverse is true.
 *
 * This only flips a flag on <html>; the hiding itself lives in globals.css next to the
 * existing EchoDesk offsets, because the vendor styles the launcher inline and `!important`
 * is the only thing that beats that. Keeping both in one place means a vendor markup change
 * breaks them together rather than leaving half the behaviour applied.
 */
const FLAG = "chatRetracted";

export function ChatWidgetPlacement() {
  useEffect(() => {
    const root = document.documentElement;
    let lastY = window.scrollY;
    let idle: ReturnType<typeof setTimeout>;

    const set = (hide: boolean) => {
      if (hide) root.dataset[FLAG] = "true";
      else delete root.dataset[FLAG];
    };

    const onScroll = () => {
      const y = window.scrollY;
      // Ignore jitter and iOS rubber-banding near the top of the page.
      if (Math.abs(y - lastY) > 8 && y > 120) set(y > lastY);
      lastY = y;
      clearTimeout(idle);
      idle = setTimeout(() => set(false), 700);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      clearTimeout(idle);
      set(false);
    };
  }, []);

  return null;
}
