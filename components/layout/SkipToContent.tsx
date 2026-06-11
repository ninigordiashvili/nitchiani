import { useTranslations } from "next-intl";

/**
 * Accessibility skip link. Visually hidden until it receives keyboard focus, at which
 * point it appears as a maroon-on-ink pill near the top-left. Tab from the very top of
 * any page → this is the first focusable element → Enter jumps the user past the
 * PromoStrip / LocalePrompt / Header / CategoryChips / BottomNav chrome straight to the
 * `<main id="main">` content.
 *
 * Targets the `main` element (which gets `id="main" tabindex={-1}` in the locale layout)
 * so the focus lands on the content container itself, not the first heading inside —
 * lets the next Tab keep flowing through the content's natural tab order.
 */
export function SkipToContent() {
  const t = useTranslations("nav");
  return (
    <a
      href="#main"
      className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:rounded-md focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:outline-none"
      style={{
        background: "var(--color-brand-ink)",
        color: "var(--color-brand-cream)",
      }}
    >
      {t("skipToContent")}
    </a>
  );
}
