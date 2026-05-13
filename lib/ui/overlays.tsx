"use client";

import { createContext, useContext, useMemo, useState } from "react";

/**
 * Shared overlay/sheet state. Lets multiple triggers (header search button, mobile bottom-nav
 * search button) control the SAME mounted SearchOverlay instance.
 *
 * Cart drawer state lives in `lib/cart/store.tsx` (it's coupled to cart data); search has no
 * data of its own beyond "is the panel open", so it lives here.
 */

type OverlaysState = {
  searchOpen: boolean;
  setSearchOpen: (open: boolean) => void;
  /** True while the mobile PDP sticky Add-to-bag bar is visible; BottomNav hides itself to avoid stacking two bars. */
  pdpCtaActive: boolean;
  setPdpCtaActive: (active: boolean) => void;
};

const OverlaysContext = createContext<OverlaysState | null>(null);

export function OverlaysProvider({ children }: { children: React.ReactNode }) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [pdpCtaActive, setPdpCtaActive] = useState(false);
  const value = useMemo(
    () => ({ searchOpen, setSearchOpen, pdpCtaActive, setPdpCtaActive }),
    [searchOpen, pdpCtaActive],
  );
  return <OverlaysContext.Provider value={value}>{children}</OverlaysContext.Provider>;
}

export function useOverlays() {
  const ctx = useContext(OverlaysContext);
  if (!ctx) throw new Error("useOverlays must be used inside <OverlaysProvider>");
  return ctx;
}
