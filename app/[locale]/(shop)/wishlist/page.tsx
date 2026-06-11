import { setRequestLocale, getTranslations } from "next-intl/server";
import { WishlistList } from "@/components/wishlist/WishlistList";
import type { Locale } from "@/lib/i18n/config";

export default async function WishlistPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("wishlist");

  // No server-side product fetch — the wishlist handles live in the client (localStorage),
  // so `WishlistList` reads them and calls a server action with only the handles it needs.
  return (
    <div className="container-shop py-8 sm:py-12">
      <h1 className="font-display mb-6 text-3xl tracking-tight sm:text-4xl">
        {t("title")}
      </h1>
      <WishlistList />
    </div>
  );
}
