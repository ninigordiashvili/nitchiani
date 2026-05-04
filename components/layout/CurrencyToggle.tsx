"use client";

import { useCurrency } from "@/lib/currency/store";
import { CURRENCY_SYMBOL, SUPPORTED_CURRENCIES } from "@/lib/currency/rates";

/**
 * Two-button pill toggle for currency. Mirrors the LanguageToggle visual rhythm so they sit
 * naturally together in the header (desktop) and the mobile menu drawer.
 */
export function CurrencyToggle() {
  const { currency, setCurrency } = useCurrency();

  return (
    <div
      className="flex items-center text-[11px] font-medium tracking-[0.18em] uppercase"
      role="group"
      aria-label="Currency"
    >
      {SUPPORTED_CURRENCIES.map((c, i) => (
        <button
          key={c}
          type="button"
          onClick={() => setCurrency(c)}
          className="cursor-pointer px-1.5 py-2 transition-opacity"
          style={{
            opacity: c === currency ? 1 : 0.4,
            color: "var(--color-brand-ink)",
          }}
          aria-current={c === currency ? "true" : undefined}
        >
          <span className="mr-1">{CURRENCY_SYMBOL[c]}</span>
          {c}
          {i < SUPPORTED_CURRENCIES.length - 1 ? (
            <span className="ml-1.5 opacity-30">/</span>
          ) : null}
        </button>
      ))}
    </div>
  );
}
