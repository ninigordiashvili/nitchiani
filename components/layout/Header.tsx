"use client";

import { Heart, Menu, Search, ShoppingBag } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { Link } from "@/lib/i18n/routing";
import type { Locale } from "@/lib/i18n/config";
import { useCart } from "@/lib/cart/store";
import { useOverlays } from "@/lib/ui/overlays";
import { useWishlist } from "@/lib/wishlist/store";
import { Logo } from "@/components/brand/Logo";
import { CountBadge } from "./CountBadge";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { MobileMenuDrawer } from "./MobileMenuDrawer";

// Mobile-only auto-hide tuning. Desktop header stays pinned at all times.
const SHOW_AT_TOP_BELOW = 50; // px from top — always visible above this
const SCROLL_DELTA_THRESHOLD = 8; // px — ignore micro-scrolls (jitter / momentum settle)
const MOBILE_QUERY = "(max-width: 639px)"; // matches Tailwind's `sm:` breakpoint

export function Header({ locale }: { locale: Locale }) {
  const t = useTranslations("nav");
  const cart = useCart();
  const wishlist = useWishlist();
  const overlays = useOverlays();
  const [menuOpen, setMenuOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);
  const ticking = useRef(false);

  useEffect(() => {
    const mq = window.matchMedia(MOBILE_QUERY);
    let mobile = mq.matches;
    if (!mobile) setHidden(false);

    const onMqChange = (e: MediaQueryListEvent) => {
      mobile = e.matches;
      // Resizing back to desktop must always reveal the header — sticky alone can't unset
      // a leftover transform from a previous mobile scroll.
      if (!mobile) setHidden(false);
    };
    mq.addEventListener("change", onMqChange);

    lastY.current = window.scrollY;
    const onScroll = () => {
      if (!mobile) return;
      if (ticking.current) return;
      ticking.current = true;
      requestAnimationFrame(() => {
        const currentY = window.scrollY;
        const delta = currentY - lastY.current;

        if (currentY < SHOW_AT_TOP_BELOW) {
          setHidden(false);
        } else if (delta > SCROLL_DELTA_THRESHOLD) {
          setHidden(true);
        } else if (delta < -SCROLL_DELTA_THRESHOLD) {
          setHidden(false);
        }

        lastY.current = currentY;
        ticking.current = false;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      mq.removeEventListener("change", onMqChange);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <>
      <header
        aria-hidden={hidden}
        className="sticky top-0 z-40 backdrop-blur-md"
        style={{
          background: "color-mix(in oklab, var(--color-brand-cream) 92%, transparent)",
          borderBottom: "1px solid rgba(13,13,13,0.08)",
          transform: hidden ? "translateY(-100%)" : "translateY(0)",
          transition: "transform 0.25s var(--ease-brand)",
          willChange: "transform",
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
            {/* Single dropdown trigger for currency + language. Replaces the previous inline pair
                so the centred logo actually centres on mobile. */}
            <LocaleSwitcher locale={locale} />
            <button
              type="button"
              onClick={() => overlays.setSearchOpen(true)}
              aria-label={t("search")}
              className="flex h-10 w-10 cursor-pointer items-center justify-center"
            >
              <Search size={18} />
            </button>
            {/* Wishlist + bag are mobile-only in the BottomNav; show in header on sm+ where the bottom nav is hidden. */}
            <Link
              href="/wishlist"
              aria-label={t("wishlist")}
              className="relative hidden h-10 w-10 cursor-pointer items-center justify-center sm:flex"
            >
              <Heart size={18} />
              {wishlist.count > 0 ? (
                <CountBadge count={wishlist.count} className="-top-0.5 -right-0.5" />
              ) : null}
            </Link>
            <button
              type="button"
              onClick={() => cart.setOpen(true)}
              aria-label={t("cart")}
              className="relative -mr-2 hidden h-10 w-10 cursor-pointer items-center justify-center sm:flex"
            >
              <ShoppingBag size={18} />
              {cart.totalQuantity > 0 ? (
                <CountBadge count={cart.totalQuantity} className="-top-0.5 -right-0.5" />
              ) : null}
            </button>
          </div>
        </div>
      </header>
      <MobileMenuDrawer open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
