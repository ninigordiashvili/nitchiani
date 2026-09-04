import { defineRouting } from "next-intl/routing";
import { createNavigation } from "next-intl/navigation";
import { defaultLocale, locales } from "./config";

export const routing = defineRouting({
  locales: [...locales],
  defaultLocale,
  localePrefix: "always",
  // Off deliberately. By default next-intl reads `Accept-Language` and redirects, which sent
  // most visitors to `/en` — Chrome ships `en-US` regardless of where it is running, so the
  // store read as English-first in its own market. The shop is in Tbilisi and sells mainly to
  // Georgian speakers, so Georgian is what everyone lands on.
  //
  // Browser preference is still honoured, just as an offer rather than a redirect:
  // `components/layout/LocalePrompt.tsx` reads `navigator.languages` and shows a dismissible
  // banner in the suggested language. An English speaker sees "This site is also available in
  // English" instead of being silently taken somewhere the shop didn't choose.
  localeDetection: false,
});

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
