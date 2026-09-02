import type { Metadata } from "next";
import Script from "next/script";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { manrope, notoSansGeorgian, notoSerifGeorgian, tenorSans } from "@/lib/fonts";
import { SiteJsonLd } from "@/components/seo/SiteJsonLd";
import { ogLocale } from "@/lib/seo";
import { BackButton } from "@/components/layout/BackButton";
import { CookieConsentBanner } from "@/components/layout/CookieConsentBanner";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { PromoStrip } from "@/components/layout/PromoStrip";
import { CartDrawer } from "@/components/layout/CartDrawer";
import { BottomNav } from "@/components/layout/BottomNav";
import { LocalePrompt } from "@/components/layout/LocalePrompt";
import { SkipToContent } from "@/components/layout/SkipToContent";
// import { ContactFloater } from "@/components/layout/ContactFloater";  // removed — EchoDesk chat owns the corner now
import { WelcomePopup } from "@/components/layout/WelcomePopup";
import { SearchOverlay } from "@/components/search/SearchOverlay";
import { QuickViewModal } from "@/components/commerce/QuickViewModal";
import { ChatWidgetPlacement } from "@/components/ui/ChatWidgetPlacement";
import { CartProvider } from "@/lib/cart/store";
import { CookieConsentProvider } from "@/lib/ui/cookie-consent";
import { CurrencyProvider } from "@/lib/currency/store";
import { RecentlyViewedProvider } from "@/lib/recently-viewed/store";
import { OverlaysProvider } from "@/lib/ui/overlays";
import { QuickViewProvider } from "@/lib/ui/quick-view";
import { WishlistProvider } from "@/lib/wishlist/store";
import { isLocale, locales, type Locale } from "@/lib/i18n/config";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  // Default og:locale for every page. Pages that set their own `openGraph` re-spread
  // `ogLocale(locale)` (Next picks the deepest openGraph, it does not deep-merge).
  return { openGraph: ogLocale(locale) };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html
      lang={locale}
      className={`${manrope.variable} ${tenorSans.variable} ${notoSansGeorgian.variable} ${notoSerifGeorgian.variable}`}
    >
      <body>
        <SiteJsonLd locale={locale as Locale} />
        <NextIntlClientProvider locale={locale} messages={messages}>
          <CookieConsentProvider>
      <CurrencyProvider>
        <WishlistProvider>
          <RecentlyViewedProvider>
            <CartProvider>
              <QuickViewProvider>
                <OverlaysProvider>
                <div className="flex min-h-dvh flex-col">
                  <SkipToContent />
                  <PromoStrip />
                  <LocalePrompt />
                  <Header locale={locale as Locale} />
                  {/* `id="main"` is the skip-link target; `tabIndex={-1}` makes it programmatically
                      focusable without putting it in the natural tab order. `pb-20` reserves
                      space for the mobile BottomNav (hidden on sm+). */}
                  <main
                    id="main"
                    tabIndex={-1}
                    className="flex-1 pb-20 outline-none sm:pb-0"
                  >
                    <BackButton />
                    {children}
                  </main>
                  <Footer />
                  <CartDrawer locale={locale as Locale} />
                  <SearchOverlay />
                  <QuickViewModal />
                  <BottomNav />
                  {/* <ContactFloater /> — removed; the EchoDesk chat button below owns
                      the bottom-right corner. Its WhatsApp / Instagram / email links now
                      live in the footer contact column. */}
                  <WelcomePopup />
                  <CookieConsentBanner />
                  {/* EchoDesk live chat. Injects its own fixed button (bottom-right,
                      z-index ~2.1e9) and an iframe against echodesk.ge — both origins
                      are allowlisted in the CSP in next.config.ts, so keep the two in
                      sync if the vendor ever changes hosts. */}
                  <Script
                    src="https://echodesk.ge/widget.js?t=wgt_live_uiW4-k34AQvHTgKP2hzgFVDa8sA6icAz"
                    strategy="afterInteractive"
                  />
                  {/* Retracts the vendor's button while scrolling — it otherwise parks on the
                      product grid's wishlist heart and quick-view control. */}
                  <ChatWidgetPlacement />
                </div>
                </OverlaysProvider>
              </QuickViewProvider>
            </CartProvider>
          </RecentlyViewedProvider>
        </WishlistProvider>
      </CurrencyProvider>
          </CookieConsentProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
