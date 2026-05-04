/**
 * Currency conversion. The site transacts in GEL — Shopify orders, BOG/TBC payment sessions, and
 * cart line items all stay in Georgian Lari. USD (and any future currencies) is a *display-only*
 * affordance for foreign visitors browsing from Instagram.
 *
 * Rates are hardcoded for v1. When the brand goes international, swap `convert()` for a small
 * cached fetch of e.g. https://api.frankfurter.app/latest?from=GEL with daily revalidation.
 */

export type Currency = "GEL" | "USD";

export const SUPPORTED_CURRENCIES: Currency[] = ["GEL", "USD"];
export const DEFAULT_CURRENCY: Currency = "GEL";

/** Approximate rate as of early 2026. Update quarterly until a live feed is wired. */
const RATE_GEL_PER_USD = 2.7;

const RATES: Record<Currency, Record<Currency, number>> = {
  GEL: { GEL: 1, USD: 1 / RATE_GEL_PER_USD },
  USD: { GEL: RATE_GEL_PER_USD, USD: 1 },
};

export function convert(amount: number, from: Currency, to: Currency): number {
  if (from === to) return amount;
  return amount * RATES[from][to];
}

export const CURRENCY_SYMBOL: Record<Currency, string> = {
  GEL: "₾",
  USD: "$",
};

export function isCurrency(v: string): v is Currency {
  return (SUPPORTED_CURRENCIES as string[]).includes(v);
}
