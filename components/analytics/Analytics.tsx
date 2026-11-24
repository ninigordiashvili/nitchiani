"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useCookieConsent } from "@/lib/ui/cookie-consent";
import { GA_ID, ensureGtag, trackEvent } from "@/lib/analytics/ga";
import { newMarks, scrollPercent } from "@/lib/analytics/scroll";

/**
 * Google Analytics 4, gated on cookie consent.
 *
 * Nothing is requested from Google until the visitor has actually accepted — not the gtag
 * script, not a single beacon. That is the point: loading the tag and then telling it not to
 * track still hands Google the visitor's IP and referrer, which is the thing consent exists to
 * prevent. Rejecting, or simply not answering the banner yet, means this renders nothing.
 *
 * Invisible when `NEXT_PUBLIC_GA_MEASUREMENT_ID` is unset, so local and preview builds don't
 * pollute the property with traffic nobody made.
 */
export function Analytics() {
  const { decision } = useCookieConsent();
  const pathname = usePathname();
  const enabled = Boolean(GA_ID) && decision === "accepted";

  // App Router navigations don't reload the page, so GA's own automatic page_view fires once
  // and never again. Without this every visit reads as a single-page session.
  useEffect(() => {
    if (!enabled || !ensureGtag()) return;
    window.gtag!("event", "page_view", {
      // Read from `location` rather than `useSearchParams`, which would force this subtree
      // into a Suspense boundary — and the query string is what distinguishes /shop?q=oil.
      page_path: window.location.pathname + window.location.search,
      page_location: window.location.href,
      page_title: document.title,
    });
  }, [enabled, pathname]);

  // `scroll_depth` at 25 / 50 / 75 %, each once per page view. The set starts empty again on
  // every navigation, because a new route is a new page view. GA's built-in `scroll` event
  // (90 %) is left alone — it fires on its own, and these marks stop short of it.
  useEffect(() => {
    if (!enabled) return;
    const sent = new Set<number>();
    const check = () => {
      const el = document.documentElement;
      const percent = scrollPercent(window.scrollY, el.scrollHeight, window.innerHeight);
      for (const mark of newMarks(percent, sent)) {
        sent.add(mark);
        trackEvent("scroll_depth", {
          scroll_percent: mark,
          page_path: window.location.pathname,
        });
      }
    };
    window.addEventListener("scroll", check, { passive: true });
    return () => window.removeEventListener("scroll", check);
  }, [enabled, pathname]);

  if (!enabled) return null;

  return (
    <Script
      src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
      strategy="afterInteractive"
    />
  );
}
