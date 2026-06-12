import type { Metadata } from "next";

// Covers /checkout and its children (/checkout/success, /checkout/failed) — all personal,
// transient, no search value. robots.txt already disallows crawling; this `noindex` is
// defense-in-depth, and lives on a layout because the checkout page is a client component.
export const metadata: Metadata = {
  robots: { index: false, follow: true },
};

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
