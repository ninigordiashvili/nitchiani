import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { PromoStrip } from "@/components/layout/PromoStrip";
import { CartDrawer } from "@/components/layout/CartDrawer";
import { BottomNav } from "@/components/layout/BottomNav";
import { WhatsAppFloater } from "@/components/layout/WhatsAppFloater";
import { InstagramFloater } from "@/components/layout/InstagramFloater";
import { WelcomePopup } from "@/components/layout/WelcomePopup";
import { SearchOverlay } from "@/components/search/SearchOverlay";
import { QuickViewModal } from "@/components/commerce/QuickViewModal";
import { CartProvider } from "@/lib/cart/store";
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
      <CurrencyProvider>
        <WishlistProvider>
          <RecentlyViewedProvider>
            <CartProvider>
              <QuickViewProvider>
                <OverlaysProvider>
                <div lang={locale} className="flex min-h-dvh flex-col">
                  <PromoStrip />
                  <Header locale={locale as Locale} />
                  {/* pb-20 reserves space for the mobile BottomNav (hidden on sm+) */}
                  <main className="flex-1 pb-20 sm:pb-0">{children}</main>
                  <Footer />
                  <CartDrawer locale={locale as Locale} />
                  <SearchOverlay />
                  <QuickViewModal />
                  <BottomNav />
                  <WhatsAppFloater />
                  <InstagramFloater />
                  <WelcomePopup />
                </div>
                </OverlaysProvider>
              </QuickViewProvider>
            </CartProvider>
          </RecentlyViewedProvider>
        </WishlistProvider>
      </CurrencyProvider>
    </NextIntlClientProvider>
  );
}
