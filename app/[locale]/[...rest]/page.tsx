import { notFound } from "next/navigation";

/**
 * Any /ka/… or /en/… URL that matches no page.
 *
 * Without this, those fell through to app/not-found.tsx — the root 404, which sits outside
 * the locale layout and so has no header, no footer, and no idea which language was asked
 * for. It could only ever speak Georgian, so /en/some-typo answered an English visitor in
 * Georgian. Routing them here keeps them inside [locale], where `notFound()` renders
 * app/[locale]/not-found.tsx: the full site chrome, in the visitor's own language.
 *
 * Every real route is more specific than a catch-all, so this only ever sees the misses.
 */
export default function UnmatchedLocaleRoute() {
  notFound();
}
