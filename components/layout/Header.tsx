"use client";

import { Heart, Menu, Search, ShoppingBag } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Link } from "@/lib/i18n/routing";
import type { Locale } from "@/lib/i18n/config";
import { useCart } from "@/lib/cart/store";
import { useOverlays } from "@/lib/ui/overlays";
import { useWishlist } from "@/lib/wishlist/store";
import { Logo } from "@/components/brand/Logo";
import { CurrencyToggle } from "./CurrencyToggle";
import { LanguageToggle } from "./LanguageToggle";
import { MobileMenuDrawer } from "./MobileMenuDrawer";

export function Header({ locale }: { locale: Locale }) {
  const t = useTranslations("nav");
  const cart = useCart();
  const wishlist = useWishlist();
  const overlays = useOverlays();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <header
        className="sticky top-0 z-40 backdrop-blur-md"
        style={{
          background: "color-mix(in oklab, var(--color-brand-cream) 92%, transparent)",
          borderBottom: "1px solid rgba(13,13,13,0.08)",
        }}
      >
        <div className="container-shop flex h-14 items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label={t("menu")}
              className="-ml-2 flex h-10 w-10 items-center justify-center"
            >
              <Menu size={20} />
            </button>
          </div>

          <Link href="/" className="flex-1 text-center" aria-label="Nitchiani — Home">
            <Logo variant="text" />
          </Link>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => overlays.setSearchOpen(true)}
              aria-label={t("search")}
              className="flex h-10 w-10 cursor-pointer items-center justify-center"
            >
              <Search size={18} />
            </button>
            <div className="hidden sm:flex sm:items-center sm:gap-2">
              <CurrencyToggle />
              <span className="text-[var(--color-brand-silver-2)] opacity-40">·</span>
              <LanguageToggle locale={locale} />
            </div>
            {/* Wishlist + bag are mobile-only in the BottomNav; show in header on sm+ where the bottom nav is hidden. */}
            <Link
              href="/wishlist"
              aria-label={t("wishlist")}
              className="relative hidden h-10 w-10 cursor-pointer items-center justify-center sm:flex"
            >
              <Heart size={18} />
              {wishlist.count > 0 ? (
                <CountBadge count={wishlist.count} />
              ) : null}
            </Link>
            <button
              type="button"
              onClick={() => cart.setOpen(true)}
              aria-label={t("cart")}
              className="relative -mr-2 hidden h-10 w-10 cursor-pointer items-center justify-center sm:flex"
            >
              <ShoppingBag size={18} />
              {cart.totalQuantity > 0 ? <CountBadge count={cart.totalQuantity} /> : null}
            </button>
          </div>
        </div>
      </header>
      <MobileMenuDrawer open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}

function CountBadge({ count }: { count: number }) {
  return (
    <span
      className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-semibold"
      style={{
        background: "var(--color-brand-maroon)",
        color: "var(--color-brand-cream)",
      }}
    >
      {count}
    </span>
  );
}
