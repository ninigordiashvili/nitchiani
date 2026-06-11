import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { BackButton } from "@/components/layout/BackButton";
import { CookieConsentBanner } from "@/components/layout/CookieConsentBanner";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { PromoStrip } from "@/components/layout/PromoStrip";
import { CartDrawer } from "@/components/layout/CartDrawer";
import { BottomNav } from "@/components/layout/BottomNav";
import { LocalePrompt } from "@/components/layout/LocalePrompt";
import { SkipToContent } from "@/components/layout/SkipToContent";
import { ContactFloater } from "@/components/layout/ContactFloater";
import { WelcomePopup } from "@/components/layout/WelcomePopup";
import { SearchOverlay } from "@/components/search/SearchOverlay";
import { QuickViewModal } from "@/components/commerce/QuickViewModal";
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
    <NextIntlClientProvider locale={locale} messages={messages}>
      <CookieConsentProvider>
      <CurrencyProvider>
        <WishlistProvider>
          <RecentlyViewedProvider>
            <CartProvider>
              <QuickViewProvider>
                <OverlaysProvider>
                <div lang={locale} className="flex min-h-dvh flex-col">
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
                  <ContactFloater />
                  <WelcomePopup />
                  <CookieConsentBanner />
                </div>
                </OverlaysProvider>
              </QuickViewProvider>
            </CartProvider>
          </RecentlyViewedProvider>
        </WishlistProvider>
      </CurrencyProvider>
      </CookieConsentProvider>
    </NextIntlClientProvider>
  );
}
