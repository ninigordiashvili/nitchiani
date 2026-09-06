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

// Bump when stored snapshots stop matching the catalog.
//   v2 → catalog moved to EchoDesk. Entries are copies of title/image/price taken at view
//        time, so stale ones would render a rail of products the shop no longer sells,
//        each linking to a 404.
const STORAGE_KEY = "nitchiani:recent:v2";
const LEGACY_STORAGE_KEYS = ["nitchiani:recent:v1"];
const MAX_ITEMS = 12;
/** Entries older than this are pruned on hydration / sync. 30 days fits the "recently"
 *  framing — a product viewed last month is no longer "recent" in any meaningful sense. */
const MAX_AGE_MS = 1000 * 60 * 60 * 24 * 30;

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
  /** ISO timestamp set when the entry was added. Optional for back-compat with older
   *  storage entries; missing values are treated as "expired" so legacy data ages out
   *  rather than living forever. */
  addedAt?: string;
};

/** Pulls only the entries within the 30-day window. Used on hydration + storage-event sync. */
function pruneStale(items: RecentlyViewedItem[]): RecentlyViewedItem[] {
  const now = Date.now();
  return items.filter((i) => {
    if (!i.addedAt) return false; // legacy entries with no timestamp ageout immediately
    const age = now - new Date(i.addedAt).getTime();
    return Number.isFinite(age) && age >= 0 && age <= MAX_AGE_MS;
  });
}

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
      for (const key of LEGACY_STORAGE_KEYS) localStorage.removeItem(key);
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as unknown;
        if (Array.isArray(parsed)) {
          // Prune stale entries on read so the UI never renders a 3-month-old "recent" item.
          setItems(pruneStale(parsed as RecentlyViewedItem[]).slice(0, MAX_ITEMS));
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

  // Cross-tab sync. A PDP visit in Tab A bumps the rail in Tab B without a refresh.
  // Same pruning applied here so a stale entry can't sneak back in via the sync path.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.storageArea !== localStorage || e.key !== STORAGE_KEY) return;
      try {
        const parsed = e.newValue ? (JSON.parse(e.newValue) as unknown) : [];
        if (Array.isArray(parsed)) {
          setItems(pruneStale(parsed as RecentlyViewedItem[]).slice(0, MAX_ITEMS));
        }
      } catch {
        // ignore corrupted/foreign payloads
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const add = useCallback((item: RecentlyViewedItem) => {
    const stamped: RecentlyViewedItem = {
      ...item,
      addedAt: item.addedAt ?? new Date().toISOString(),
    };
    setItems((prev) => {
      const without = prev.filter((p) => p.handle !== stamped.handle);
      return [stamped, ...without].slice(0, MAX_ITEMS);
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
