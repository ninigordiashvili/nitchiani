"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { DEFAULT_CURRENCY, isCurrency, type Currency } from "./rates";

const STORAGE_KEY = "nitchiani:currency:v1";

type CurrencyState = {
  currency: Currency;
  setCurrency: (next: Currency) => void;
};

const CurrencyContext = createContext<CurrencyState | null>(null);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>(DEFAULT_CURRENCY);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw && isCurrency(raw)) setCurrencyState(raw);
    } catch {
      // ignore corrupted storage
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, currency);
  }, [currency, hydrated]);

  const value = useMemo<CurrencyState>(
    () => ({ currency, setCurrency: setCurrencyState }),
    [currency],
  );

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error("useCurrency must be used inside <CurrencyProvider>");
  return ctx;
}
