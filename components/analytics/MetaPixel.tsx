"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useCookieConsent } from "@/lib/ui/cookie-consent";
import { META_ENABLED, ensureFbq } from "@/lib/analytics/meta";

/**
 * Meta Pixel loader, gated like <Analytics/>: nothing is requested from Meta until the visitor
 * has accepted, and not at all unless the pixel is switched on (see lib/analytics/meta.ts).
 * Sends `PageView` once on arrival and once per in-site navigation.
 */
export function MetaPixel() {
  const { decision } = useCookieConsent();
  const pathname = usePathname();
  const enabled = META_ENABLED && decision === "accepted";

  useEffect(() => {
    if (!enabled || !ensureFbq()) return;
    window.fbq!("track", "PageView");
  }, [enabled, pathname]);

  if (!enabled) return null;
  return <Script src="https://connect.facebook.net/en_US/fbevents.js" strategy="afterInteractive" />;
}
