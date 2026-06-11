"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "nitchiani:wishlist:v1";
const LEGACY_STORAGE_KEYS: string[] = []; // populate when bumping versions

type WishlistState = {
  handles: string[];
  count: number;
  has: (handle: string) => boolean;
  toggle: (handle: string) => void;
  add: (handle: string) => void;
  remove: (handle: string) => void;
  clear: () => void;
};

const WishlistContext = createContext<WishlistState | null>(null);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [handles, setHandles] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      for (const key of LEGACY_STORAGE_KEYS) localStorage.removeItem(key);
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as unknown;
        if (Array.isArray(parsed)) {
          setHandles(parsed.filter((h): h is string => typeof h === "string"));
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
    localStorage.setItem(STORAGE_KEY, JSON.stringify(handles));
  }, [handles, hydrated]);

  // Cross-tab sync — a heart tap in Tab A updates Tab B's count and filled state without
  // requiring a refresh. The `storage` event only fires in OTHER tabs, so there's no echo
  // loop from this tab's own writes.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.storageArea !== localStorage || e.key !== STORAGE_KEY) return;
      try {
        const parsed = e.newValue ? (JSON.parse(e.newValue) as unknown) : [];
        if (Array.isArray(parsed)) {
          setHandles(parsed.filter((h): h is string => typeof h === "string"));
        }
      } catch {
        // ignore corrupted/foreign payloads
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const has = useCallback((handle: string) => handles.includes(handle), [handles]);

  const add = useCallback((handle: string) => {
    setHandles((prev) => (prev.includes(handle) ? prev : [...prev, handle]));
  }, []);

  const remove = useCallback((handle: string) => {
    setHandles((prev) => prev.filter((h) => h !== handle));
  }, []);

  const toggle = useCallback((handle: string) => {
    setHandles((prev) =>
      prev.includes(handle) ? prev.filter((h) => h !== handle) : [...prev, handle],
    );
  }, []);

  const clear = useCallback(() => setHandles([]), []);

  const value = useMemo<WishlistState>(
    () => ({
      handles,
      count: handles.length,
      has,
      toggle,
      add,
      remove,
      clear,
    }),
    [handles, has, toggle, add, remove, clear],
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used inside <WishlistProvider>");
  return ctx;
}
