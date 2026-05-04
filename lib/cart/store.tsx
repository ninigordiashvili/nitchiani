"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ImageRef, Money } from "../shopify/types";

// Bump the version when image hosts or line shape change, so stale localStorage entries
// don't crash the cart UI on the next visit.
//   v1 → Unsplash URLs (broken hostnames)
//   v2 → picsum + local images
//   v3 → variant titles changed (no longer always "One Size") — old variantIds may be stale
const STORAGE_KEY = "nitchiani:cart:v3";
const LEGACY_STORAGE_KEYS = ["nitchiani:cart:v1", "nitchiani:cart:v2"];

export type LocalCartLine = {
  variantId: string;
  productHandle: string;
  productTitle: string;
  variantTitle: string;
  image: ImageRef;
  unitPrice: Money;
  quantity: number;
};

type CartState = {
  lines: LocalCartLine[];
  totalQuantity: number;
  subtotal: Money;
};

type CartActions = {
  addLine: (line: Omit<LocalCartLine, "quantity"> & { quantity?: number }) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  removeLine: (variantId: string) => void;
  clear: () => void;
  open: boolean;
  setOpen: (open: boolean) => void;
};

const CartContext = createContext<(CartState & CartActions) | null>(null);

function computeTotals(lines: LocalCartLine[]): {
  totalQuantity: number;
  subtotal: Money;
} {
  const totalQuantity = lines.reduce((sum, l) => sum + l.quantity, 0);
  const currency = lines[0]?.unitPrice.currencyCode ?? "GEL";
  const amount = lines.reduce(
    (sum, l) => sum + Number.parseFloat(l.unitPrice.amount) * l.quantity,
    0,
  );
  return {
    totalQuantity,
    subtotal: { amount: amount.toFixed(2), currencyCode: currency },
  };
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<LocalCartLine[]>([]);
  const [open, setOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      // Wipe legacy versions so old image URLs (now banned hosts) can't crash the cart UI.
      for (const key of LEGACY_STORAGE_KEYS) localStorage.removeItem(key);

      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setLines(JSON.parse(raw) as LocalCartLine[]);
    } catch {
      // ignore corrupted storage
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  }, [lines, hydrated]);

  const addLine = useCallback(
    (line: Omit<LocalCartLine, "quantity"> & { quantity?: number }) => {
      const qty = line.quantity ?? 1;
      setLines((prev) => {
        const idx = prev.findIndex((l) => l.variantId === line.variantId);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = { ...next[idx], quantity: next[idx].quantity + qty };
          return next;
        }
        return [...prev, { ...line, quantity: qty }];
      });
      setOpen(true);
    },
    [],
  );

  const updateQuantity = useCallback((variantId: string, quantity: number) => {
    setLines((prev) =>
      quantity <= 0
        ? prev.filter((l) => l.variantId !== variantId)
        : prev.map((l) => (l.variantId === variantId ? { ...l, quantity } : l)),
    );
  }, []);

  const removeLine = useCallback((variantId: string) => {
    setLines((prev) => prev.filter((l) => l.variantId !== variantId));
  }, []);

  const clear = useCallback(() => setLines([]), []);

  const totals = useMemo(() => computeTotals(lines), [lines]);

  const value = useMemo(
    () => ({
      lines,
      ...totals,
      addLine,
      updateQuantity,
      removeLine,
      clear,
      open,
      setOpen,
    }),
    [lines, totals, addLine, updateQuantity, removeLine, clear, open],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
