export const locales = ["ka", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "ka";

export const localeNames: Record<Locale, string> = {
  ka: "ქართული",
  en: "English",
};

export const localeShortNames: Record<Locale, string> = {
  ka: "ka",
  en: "en",
};

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}
