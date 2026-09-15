"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useCookieConsent } from "@/lib/ui/cookie-consent";

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
const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export function Analytics() {
  const { decision } = useCookieConsent();
  const pathname = usePathname();
  const enabled = Boolean(GA_ID) && decision === "accepted";

  // App Router navigations don't reload the page, so GA's own automatic page_view fires once
  // and never again. Without this every visit reads as a single-page session.
  useEffect(() => {
    if (!enabled || typeof window.gtag !== "function") return;
    window.gtag("event", "page_view", {
      // Read from `location` rather than `useSearchParams`, which would force this subtree
      // into a Suspense boundary — and the query string is what distinguishes /shop?q=oil.
      page_path: window.location.pathname + window.location.search,
      page_location: window.location.href,
      page_title: document.title,
    });
  }, [enabled, pathname]);

  if (!enabled) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = gtag;
          gtag('js', new Date());
          // The effect above sends page_view on every navigation, this one included, so GA's
          // own would double-count the landing page.
          gtag('config', '${GA_ID}', { send_page_view: false, anonymize_ip: true });
        `}
      </Script>
    </>
  );
}
