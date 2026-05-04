import type { Locale } from "./i18n/config";
import { CURRENCY_SYMBOL, convert, isCurrency, type Currency } from "./currency/rates";

export type Money = {
  amount: string;
  currencyCode: string;
};

const localeMap: Record<Locale, string> = {
  ka: "ka-GE",
  en: "en-US",
};

/**
 * Format a Money value for display, optionally converted into the user's preferred currency.
 *
 * - The transaction layer (cart lines, checkout, Shopify orders, BOG/TBC) always stays in the
 *   product's native currency (GEL).
 * - This formatter is for the *display* layer only — pass `displayCurrency` to render in the
 *   user-selected currency. Conversion is round-tripped through the rate table in `currency/rates.ts`.
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

  // GEL keeps its custom prefix (Intl.NumberFormat would put it in the wrong place for ka-GE).
  if (targetCurrency === "GEL") {
    return `${CURRENCY_SYMBOL.GEL}${converted.toLocaleString(localeMap[locale], {
      minimumFractionDigits: converted % 1 === 0 ? 0 : 2,
      maximumFractionDigits: 2,
    })}`;
  }

  // USD: round to whole dollars for cleaner foreign-currency display (₾89 → $33, not $32.96).
  const rounded = Math.round(converted);
  return `${CURRENCY_SYMBOL.USD}${rounded.toLocaleString(localeMap[locale])}`;
}
