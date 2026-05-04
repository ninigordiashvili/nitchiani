"use client";

import { Heart, Home, Search, ShoppingBag, Store } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { Link, usePathname } from "@/lib/i18n/routing";
import { useCart } from "@/lib/cart/store";
import { useOverlays } from "@/lib/ui/overlays";
import { useWishlist } from "@/lib/wishlist/store";
import { cn } from "@/lib/utils";

/**
 * Sticky bottom nav for mobile/tablet. Hidden on `sm:` and up — desktop has the full header
 * controls already.
 *
 * Auto-hide behavior: slides off-screen on scroll-down (let the user read), slides back on
 * scroll-up (commitment to navigate), and is always visible near the top of the page.
 *
 * Shop/Home/Wishlist are real navigation links (active state via current path).
 * Search opens the shared SearchOverlay; Bag opens the cart drawer.
 */
const SHOW_AT_TOP_BELOW = 50; // px from top — always visible above this
const SCROLL_DELTA_THRESHOLD = 8; // px — ignore micro-scrolls (jitter / momentum settle)

export function BottomNav() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const cart = useCart();
  const wishlist = useWishlist();
  const overlays = useOverlays();

  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);
  const ticking = useRef(false);

  useEffect(() => {
    lastY.current = window.scrollY;
    const onScroll = () => {
      if (ticking.current) return;
      ticking.current = true;
      requestAnimationFrame(() => {
        const currentY = window.scrollY;
        const delta = currentY - lastY.current;

        if (currentY < SHOW_AT_TOP_BELOW) {
          setHidden(false);
        } else if (delta > SCROLL_DELTA_THRESHOLD) {
          // Scrolling down → hide
          setHidden(true);
        } else if (delta < -SCROLL_DELTA_THRESHOLD) {
          // Scrolling up → show
          setHidden(false);
        }

        lastY.current = currentY;
        ticking.current = false;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <nav
      aria-label={t("menu")}
      aria-hidden={hidden}
      className="sm:hidden"
      style={{
        position: "fixed",
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 30,
        // Respect iOS safe area on devices with a home indicator
        paddingBottom: "env(safe-area-inset-bottom)",
        background: "color-mix(in oklab, var(--color-brand-cream) 96%, transparent)",
        backdropFilter: "blur(8px)",
        borderTop: "1px solid rgba(13,13,13,0.08)",
        transform: hidden ? "translateY(100%)" : "translateY(0)",
        transition: "transform 0.25s var(--ease-brand)",
        willChange: "transform",
      }}
    >
      <ul className="grid grid-cols-5">
        <NavItem
          href="/"
          icon={<Home size={20} />}
          label={t("home")}
          active={isActive("/")}
        />
        <NavItem
          href="/shop"
          icon={<Store size={20} />}
          label={t("shop")}
          active={isActive("/shop")}
        />
        <li>
          <button
            type="button"
            onClick={() => overlays.setSearchOpen(true)}
            className="flex w-full cursor-pointer flex-col items-center justify-center gap-0.5 py-2 transition-colors"
            aria-label={t("search")}
          >
            <Search size={20} />
            <span className="text-[10px] tracking-[0.05em]">{t("search")}</span>
          </button>
        </li>
        <NavItem
          href="/wishlist"
          icon={<Heart size={20} />}
          label={t("wishlist")}
          active={isActive("/wishlist")}
          badge={wishlist.count}
        />
        <li>
          <button
            type="button"
            onClick={() => cart.setOpen(true)}
            className="flex w-full cursor-pointer flex-col items-center justify-center gap-0.5 py-2 transition-colors"
            aria-label={t("cart")}
          >
            <span className="relative">
              <ShoppingBag size={20} />
              {cart.totalQuantity > 0 ? <Badge count={cart.totalQuantity} /> : null}
            </span>
            <span className="text-[10px] tracking-[0.05em]">{t("cart")}</span>
          </button>
        </li>
      </ul>
    </nav>
  );
}

function NavItem({
  href,
  icon,
  label,
  active,
  badge,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
  badge?: number;
}) {
  return (
    <li>
      <Link
        href={href}
        aria-current={active ? "page" : undefined}
        className={cn(
          "flex flex-col items-center justify-center gap-0.5 py-2 transition-colors",
          active ? "text-[var(--color-brand-maroon)]" : "text-[var(--color-brand-ink)]",
        )}
      >
        <span className="relative">
          {icon}
          {badge && badge > 0 ? <Badge count={badge} /> : null}
        </span>
        <span className="text-[10px] tracking-[0.05em]">{label}</span>
      </Link>
    </li>
  );
}

function Badge({ count }: { count: number }) {
  return (
    <span
      className="absolute -top-1.5 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-semibold"
      style={{ background: "var(--color-brand-maroon)", color: "var(--color-brand-cream)" }}
    >
      {count}
    </span>
  );
}
