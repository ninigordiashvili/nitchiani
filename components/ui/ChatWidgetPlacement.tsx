"use client";

import { useEffect } from "react";

/**
 * Retracts the EchoDesk chat launcher while the shopper is scrolling, and hides it outright
 * while a drawer or modal is open.
 *
 * The vendor parks a 56px launcher in the bottom-right corner. On a product grid that corner
 * belongs to a card's wishlist heart and quick-view "+" — measured overlapping both at 1280px
 * and at 390px. There is no corner that never collides, because the grid tiles the viewport,
 * so rather than moving the launcher we get it out of the way exactly while the shopper is
 * scanning and bring it back the moment they settle or scroll up. Browsing is when the
 * obstruction matters and the launcher doesn't; standing still is when the reverse is true.
 *
 * The overlay case is not cosmetic: the launcher carries z-index 2147483000, which is higher
 * than anything the app can reasonably set, so it floats *over* the mobile menu, the cart
 * drawer and the search panel — a button from a different surface sitting on top of the one
 * the shopper is using, and tapping it opens a chat behind the drawer.
 *
 * "Is an overlay open" is read from `body.style.overflow === "hidden"`. Every drawer and modal
 * here locks body scroll on open (MobileMenuDrawer, CartDrawer, SearchOverlay, QuickViewModal,
 * WelcomePopup, the size guides), and WelcomePopup already depends on that same convention, so
 * this reuses an established signal rather than threading state out of six components.
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
    let scrolling = false;
    let overlayOpen = false;

    // Either reason hides it, so they're combined rather than each writing the flag —
    // otherwise the scroll timer's "show again" would reveal the launcher over an open drawer.
    const sync = () => {
      if (scrolling || overlayOpen) root.dataset[FLAG] = "true";
      else delete root.dataset[FLAG];
    };

    const onScroll = () => {
      const y = window.scrollY;
      // Ignore jitter and iOS rubber-banding near the top of the page.
      if (Math.abs(y - lastY) > 8 && y > 120) scrolling = y > lastY;
      lastY = y;
      clearTimeout(idle);
      idle = setTimeout(() => {
        scrolling = false;
        sync();
      }, 700);
      sync();
    };

    const readOverlay = () => {
      const next = document.body.style.overflow === "hidden";
      if (next === overlayOpen) return;
      overlayOpen = next;
      sync();
    };

    readOverlay();
    // Drawers toggle the lock by writing body.style directly, so watch the attribute itself.
    const observer = new MutationObserver(readOverlay);
    observer.observe(document.body, { attributes: true, attributeFilter: ["style"] });
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
      clearTimeout(idle);
      scrolling = false;
      overlayOpen = false;
      sync();
    };
  }, []);

  return null;
}
