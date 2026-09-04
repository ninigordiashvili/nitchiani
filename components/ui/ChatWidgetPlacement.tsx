"use client";

import { useEffect } from "react";

/**
 * Hides the EchoDesk chat launcher while a drawer or modal is open.
 *
 * This is not cosmetic: the launcher carries z-index 2147483000, higher than anything the app
 * can reasonably set, so it floats *over* the mobile menu, the cart drawer and the search
 * panel — a button from a different surface sitting on top of the one the shopper is using,
 * and tapping it opens a chat behind the drawer.
 *
 * "Is an overlay open" is read from `body.style.overflow === "hidden"`. Every drawer and modal
 * here locks body scroll on open (MobileMenuDrawer, CartDrawer, SearchOverlay, QuickViewModal,
 * WelcomePopup, ClarifyDetailsModal, the size guides), and WelcomePopup already depends on that
 * same convention, so this reuses an established signal rather than threading state out of
 * seven components.
 *
 * It used to retract on scroll as well, to clear the wishlist heart and quick-view "+" in the
 * corner of a product card. That overlap no longer happens — measured across the shop grid at
 * 390px and 1280px, at every scroll position, the launcher meets no card control — so all the
 * behaviour did was blink the launcher out on every downward scroll, which reads as the widget
 * breaking rather than getting out of the way. If a future layout does put a control under the
 * corner, move that control: hiding the support channel while someone browses is the more
 * expensive trade.
 *
 * This only flips a flag on <html>; the hiding itself lives in globals.css next to the
 * existing EchoDesk offsets, because the vendor styles the launcher inline and `!important`
 * is the only thing that beats that.
 */
const FLAG = "chatRetracted";

export function ChatWidgetPlacement() {
  useEffect(() => {
    const root = document.documentElement;

    const sync = () => {
      if (document.body.style.overflow === "hidden") root.dataset[FLAG] = "true";
      else delete root.dataset[FLAG];
    };

    sync();
    // Drawers toggle the lock by writing body.style directly, so watch the attribute itself.
    const observer = new MutationObserver(sync);
    observer.observe(document.body, { attributes: true, attributeFilter: ["style"] });

    return () => {
      observer.disconnect();
      delete root.dataset[FLAG];
    };
  }, []);

  return null;
}
