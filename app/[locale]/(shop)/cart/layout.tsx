import type { Metadata } from "next";

// Cart is a personal, transient surface with no search value. robots.txt already disallows
// crawling it; this `noindex` is defense-in-depth (and the cart page is a client component,
// so the directive has to live on a layout). `follow` keeps link equity flowing onward.
export const metadata: Metadata = {
  robots: { index: false, follow: true },
};

export default function CartLayout({ children }: { children: React.ReactNode }) {
  return children;
}
