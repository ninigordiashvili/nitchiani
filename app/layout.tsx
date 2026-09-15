import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SITE_URL } from "@/lib/seo";
import { seoCopy } from "@/lib/seo-copy";

// Fallback only. Every page under /[locale] overrides both from `lib/seo-copy.ts`; this is
// what a route outside the locale tree would carry, and it is English because that is the
// safer guess for a request that never told us otherwise.
const { title: TITLE, description: DESCRIPTION } = seoCopy("en");

export const metadata: Metadata = {
  title: {
    default: TITLE,
    template: "%s · Nitchiani",
  },
  description: DESCRIPTION,
  metadataBase: new URL(SITE_URL),
  openGraph: {
    type: "website",
    siteName: "Nitchiani",
  },
  // `summary_large_image` pairs with the site-wide opengraph-image (see app/opengraph-image.tsx),
  // which Next also wires up as the Twitter image automatically.
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

export const viewport: Viewport = {
  themeColor: "#0A1F1F",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

/**
 * Pass-through root layout. The real `<html>`/`<body>` live in `app/[locale]/layout.tsx`
 * so the `lang` attribute can carry the active locale — App Router lets a nested layout own
 * the document element when every page sits under a dynamic segment (the next-intl i18n
 * pattern). Metadata defined here still applies site-wide.
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
