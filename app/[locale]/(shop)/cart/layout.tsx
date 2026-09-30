import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import type { Locale } from "@/lib/i18n/config";

// Cart is a personal, transient surface with no search value. robots.txt already disallows
// crawling it; this `noindex` is defense-in-depth (and the cart page is a client component,
// so the directive — and the title — have to live on a layout). `follow` keeps link equity
// flowing onward.
//
// The title matters even unindexed: it is the browser tab. Without one the tab inherited the
// homepage headline and the "· Nitchiani" template on top of it, which read "… — Nitchiani ·
// Nitchiani".
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "nav" });
  return { title: t("cart"), robots: { index: false, follow: true } };
}

export default function CartLayout({ children }: { children: React.ReactNode }) {
  return children;
}
