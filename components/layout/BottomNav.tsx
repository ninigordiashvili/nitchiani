"use client";

import { Heart, Home, ShoppingBag } from "lucide-react";
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
 * Three slots: Home + Wishlist are nav links (active state via current path); Bag opens the
 * cart drawer. The previous `/shop` slot was dropped — Home + the category chips on the
 * homepage + the menu drawer all cover that intent. Search was dropped too: the header keeps
 * its own search button on mobile, so the affordance is still one tap away without spending
 * a bottom slot on it.
 */
export function BottomNav() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const cart = useCart();
  const wishlist = useWishlist();
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
      <ul className="grid grid-cols-3">
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
            onClick={() => cart.setOpen(true)}
            className="flex w-full cursor-pointer flex-col items-center justify-center gap-0.5 py-2 transition-colors"
            aria-label={t("cart")}
          >
            <span className="relative">
              {/* Pulses only while the bag holds something — an empty bag breathing
                  forever would be motion with nothing to say. */}
              <span
                style={
                  cart.totalQuantity > 0
                    ? { animation: "cart-pulse 2.4s ease-in-out infinite", display: "inline-flex" }
                    : undefined
                }
              >
                <ShoppingBag size={20} />
              </span>
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

