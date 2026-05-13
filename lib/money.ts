import type { Locale } from "./i18n/config";
import { CURRENCY_SYMBOL, convert, isCurrency, type Currency } from "./currency/rates";

export type Money = {
  amount: string;
  currencyCode: string;
};

/**
 * Format a Money value for display, optionally converted into the user's preferred currency.
 *
 * - The transaction layer (cart lines, checkout, Shopify orders, BOG/TBC) always stays in the
 *   product's native currency (GEL).
 * - This formatter is for the *display* layer only — pass `displayCurrency` to render in the
 *   user-selected currency. Conversion is round-tripped through the rate table in `currency/rates.ts`.
 *
 * Number formatting is deliberately manual (no `Number.prototype.toLocaleString` / `Intl.NumberFormat`).
 * The Intl path produced subtle differences between Node's ICU and the browser's V8 ICU for `ka-GE`,
 * which surfaced as React hydration mismatches. Manual formatting is fully deterministic across runtimes.
 */
export function formatPrice(
  money: Money,
  locale: Locale = "ka",
  displayCurrency?: Currency,
) {
  const sourceAmount = Number.parseFloat(money.amount);
  if (Number.isNaN(sourceAmount)) return "—";

  const sourceCurrency = isCurrency(money.currencyCode) ? money.currencyCode : "GEL";
  const targetCurrency: Currency = displayCurrency ?? sourceCurrency;

  const converted =
    targetCurrency === sourceCurrency
      ? sourceAmount
      : convert(sourceAmount, sourceCurrency, targetCurrency);

  if (targetCurrency === "GEL") {
    return `${CURRENCY_SYMBOL.GEL}${formatNumber(converted, locale)}`;
  }

  // USD: round to whole dollars for cleaner foreign-currency display (₾89 → $33, not $32.96).
  const rounded = Math.round(converted);
  return `${CURRENCY_SYMBOL.USD}${formatNumber(rounded, locale)}`;
}

/**
 * Locale-aware number formatter that produces identical output on server and client.
 *  - Georgian (`ka`): non-breaking-space thousands separator, comma decimal → `1 234,50`
 *  - English (`en`):  comma thousands separator, period decimal               → `1,234.50`
 *
 * Fraction is included only when the value isn't a whole number, matching the previous
 * `minimumFractionDigits: x % 1 === 0 ? 0 : 2` behavior.
 */
function formatNumber(value: number, locale: Locale): string {
  const hasFraction = value % 1 !== 0;
  const fixed = hasFraction ? value.toFixed(2) : String(Math.trunc(value));
  const [intPart, decimalPart] = fixed.split(".");

  const groupSep = locale === "ka" ? " " : ",";
  const decimalSep = locale === "ka" ? "," : ".";

  const grouped = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, groupSep);

  return decimalPart ? `${grouped}${decimalSep}${decimalPart}` : grouped;
}

/**
 * Whole-number discount percentage from a compare-at price. Returns `null` when there's no
 * real discount to surface — caller should skip rendering rather than show "0%" or "Sale".
 */
export function discountPercent(price: Money, compareAt?: Money): number | null {
  if (!compareAt) return null;
  const p = Number.parseFloat(price.amount);
  const c = Number.parseFloat(compareAt.amount);
  if (!Number.isFinite(p) || !Number.isFinite(c) || c <= 0 || p >= c) return null;
  return Math.round(((c - p) / c) * 100);
}
