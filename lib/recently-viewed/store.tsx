"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ImageRef, Money } from "../shopify/types";

/**
 * Recently viewed products. Stores compact snapshots (handle + title + image + price) in
 * localStorage so the rail can render instantly on the next page-view without a fetch.
 *
 * Snapshots can go stale (price/image edits won't propagate until the user revisits the PDP),
 * which is the acceptable tradeoff for zero-network rendering. Real-time accuracy lives on
 * the PDP itself; this is a recall surface.
 *
 * Cap is `MAX_ITEMS` so the localStorage payload stays small (~12 product snapshots ≈ a few
 * KB, well inside any browser's quota).
 */

const STORAGE_KEY = "nitchiani:recent:v1";
const MAX_ITEMS = 12;

export type RecentlyViewedItem = {
  handle: string;
  title: string;
  image: ImageRef;
  price: Money;
  /**
   * Locale-stable category slug (matches `Product.productTypeHandle`). Optional because
   * older localStorage entries written before this field existed don't carry it — the
   * homepage bundle picker treats `undefined` as "no signal" rather than crashing.
   */
  productTypeHandle?: string;
};

type RecentlyViewedState = {
  items: RecentlyViewedItem[];
  add: (item: RecentlyViewedItem) => void;
  clear: () => void;
};

const RecentlyViewedContext = createContext<RecentlyViewedState | null>(null);

export function RecentlyViewedProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<RecentlyViewedItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as unknown;
        if (Array.isArray(parsed)) {
          setItems(parsed.slice(0, MAX_ITEMS) as RecentlyViewedItem[]);
        }
      }
    } catch {
      // ignore corrupted storage
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // ignore quota errors
    }
  }, [items, hydrated]);

  const add = useCallback((item: RecentlyViewedItem) => {
    setItems((prev) => {
      const without = prev.filter((p) => p.handle !== item.handle);
      return [item, ...without].slice(0, MAX_ITEMS);
    });
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const value = useMemo<RecentlyViewedState>(
    () => ({ items, add, clear }),
    [items, add, clear],
  );

  return (
    <RecentlyViewedContext.Provider value={value}>{children}</RecentlyViewedContext.Provider>
  );
}

export function useRecentlyViewed() {
  const ctx = useContext(RecentlyViewedContext);
  if (!ctx) throw new Error("useRecentlyViewed must be used inside <RecentlyViewedProvider>");
  return ctx;
}
