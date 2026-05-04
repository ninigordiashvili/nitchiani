"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { Product } from "../shopify/types";

/**
 * Quick-view state. Lifted to a context so any ProductCard on any page (homepage grids,
 * collection pages, search results, wishlist, recommendations) can open the SAME modal
 * mounted once at the layout level.
 */

type QuickViewState = {
  product: Product | null;
  open: (product: Product) => void;
  close: () => void;
};

const QuickViewContext = createContext<QuickViewState | null>(null);

export function QuickViewProvider({ children }: { children: React.ReactNode }) {
  const [product, setProduct] = useState<Product | null>(null);

  const open = useCallback((p: Product) => setProduct(p), []);
  const close = useCallback(() => setProduct(null), []);

  const value = useMemo<QuickViewState>(() => ({ product, open, close }), [product, open, close]);

  return <QuickViewContext.Provider value={value}>{children}</QuickViewContext.Provider>;
}

export function useQuickView() {
  const ctx = useContext(QuickViewContext);
  if (!ctx) throw new Error("useQuickView must be used inside <QuickViewProvider>");
  return ctx;
}
