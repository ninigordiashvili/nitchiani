import type { Metadata, Viewport } from "next";
import { manrope, notoSansGeorgian, notoSerifGeorgian, tenorSans } from "@/lib/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Nitchiani — Premium braids, locs & haircare · Tbilisi",
    template: "%s · Nitchiani",
  },
  description:
    "Hand-crafted braids, dreadlocks and loc-care essentials from a Tbilisi studio. Shop bonnets, oils, extensions and book a session.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  openGraph: {
    type: "website",
    siteName: "Nitchiani",
  },
};

export const viewport: Viewport = {
  themeColor: "#0A1F1F",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      className={`${manrope.variable} ${tenorSans.variable} ${notoSansGeorgian.variable} ${notoSerifGeorgian.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
