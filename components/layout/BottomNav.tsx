"use client";

import { Heart, Home, Search, ShoppingBag } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/lib/i18n/routing";
import { useCart } from "@/lib/cart/store";
import { useOverlays } from "@/lib/ui/overlays";
import { useWishlist } from "@/lib/wishlist/store";
import { cn } from "@/lib/utils";
import { CountBadge } from "./CountBadge";

/**
 * Permanent bottom nav for mobile/tablet. Hidden on `sm:` and up — desktop has the full header
 * controls already.
 *
 * Always anchored to the bottom of the viewport on mobile so the primary navigation is one
 * thumb-tap away at all times. The mobile Header auto-hides on scroll-down instead, which
 * gives back vertical space without taking the nav with it.
 *
 * Only exception: on a PDP, the sticky Add-to-bag bar takes over this slot via
 * `overlays.pdpCtaActive` so the user doesn't see two stacked bars.
 *
 * Four slots: Home + Wishlist are nav links (active state via current path); Search opens the
 * search overlay and the bag opens the cart drawer. The previous `/shop` slot was dropped —
 * Home + the category chips on the homepage + the menu drawer all cover that intent.
 *
 * The bag is here as well as in the header, which is deliberate duplication. It was briefly
 * header-only, on the reasoning that one home for it is clearer than two — but the mobile
 * header auto-hides on a downward scroll, and every Add-to-bag button is far enough down a
 * page that reaching one means scrolling down. So the bag was reliably off-screen at the one
 * moment it mattered, and a customer wrote in to say they had added a durag and couldn't find
 * the cart. This nav never hides on scroll, so the count is always on screen.
 */
export function BottomNav() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const wishlist = useWishlist();
  const cart = useCart();
  const overlays = useOverlays();

  const effectiveHidden = overlays.pdpCtaActive;

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <nav
      aria-label={t("menu")}
      aria-hidden={effectiveHidden}
      className="sm:hidden"
      style={{
        position: "fixed",
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 30,
        // Respect iOS safe area on devices with a home indicator
        paddingBottom: "env(safe-area-inset-bottom)",
        background: "color-mix(in oklab, var(--surface) 96%, transparent)",
        backdropFilter: "blur(8px)",
        borderTop: "1px solid rgba(13,13,13,0.08)",
        transform: effectiveHidden ? "translateY(100%)" : "translateY(0)",
        transition: "transform 0.25s var(--ease-brand)",
        willChange: "transform",
      }}
    >
      <ul className="grid grid-cols-4">
        <NavItem
          href="/"
          icon={<Home size={20} />}
          label={t("home")}
          active={isActive("/")}
        />
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
            onClick={() => overlays.setSearchOpen(true)}
            className="flex w-full cursor-pointer flex-col items-center justify-center gap-0.5 py-2 transition-colors"
            aria-label={t("search")}
          >
            <span className="relative">
              <Search size={20} />
            </span>
            <span className="text-[10px] tracking-[0.05em]">{t("search")}</span>
          </button>
        </li>
        <li>
          <button
            type="button"
            onClick={() => cart.setOpen(true)}
            className={cn(
              "flex w-full cursor-pointer flex-col items-center justify-center gap-0.5 py-2 transition-colors",
              // Carrying something is a state worth showing, not just counting: the whole
              // slot takes the brand colour so it reads at a glance, mid-scroll, without
              // having to find and parse a 10px badge.
              cart.totalQuantity > 0
                ? "text-[var(--color-brand-maroon)]"
                : "text-[var(--color-brand-ink)]",
            )}
            aria-label={t("cart")}
          >
            <span className="relative">
              <ShoppingBag size={20} />
              {cart.totalQuantity > 0 ? (
                <CountBadge
                  count={cart.totalQuantity}
                  className="-top-1.5 -right-2"
                  motion="pulse"
                />
              ) : null}
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
          {badge && badge > 0 ? (
            <CountBadge count={badge} className="-top-1.5 -right-2" />
          ) : null}
        </span>
        <span className="text-[10px] tracking-[0.05em]">{label}</span>
      </Link>
    </li>
  );
}

