"use client";

import { X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useRef } from "react";
import { Link } from "@/lib/i18n/routing";
import { getWhatsAppNumber, WhatsAppIcon } from "@/components/brand/WhatsAppIcon";
import { useFocusTrap } from "@/lib/ui/use-focus-trap";
import { useSwipeDismiss } from "@/lib/ui/use-swipe-dismiss";

const SHOP_LINKS = [
  { href: "/shop/best-sellers", labelKey: "bestSellers" as const },
  { href: "/shop/new-arrivals", labelKey: "newArrivals" as const },
  { href: "/shop/bonnets", labelKey: "bonnets" as const },
  { href: "/shop/loc-care", labelKey: "locCare" as const },
  { href: "/shop/extensions", labelKey: "extensions" as const },
  { href: "/shop/accessories", labelKey: "accessories" as const },
  { href: "/shop/tools", labelKey: "tools" as const },
];

const SECONDARY = [
  { href: "/services", labelKey: "services" as const },
  { href: "/about", labelKey: "about" as const },
  { href: "/contact", labelKey: "contact" as const },
];

export function MobileMenuDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const t = useTranslations("nav");
  const whatsappNumber = getWhatsAppNumber();
  const { dragOffset, handlers } = useSwipeDismiss({
    direction: "left",
    onDismiss: onClose,
  });
  const drawerRef = useRef<HTMLElement>(null);
  useFocusTrap(drawerRef, open);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div
      aria-hidden={!open}
      className="fixed inset-0 z-50 transition-opacity"
      style={{ opacity: open ? 1 : 0, pointerEvents: open ? "auto" : "none" }}
    >
      <div
        className="absolute inset-0"
        style={{ background: "rgba(10,31,31,0.45)" }}
        onClick={onClose}
      />
      <aside
        ref={drawerRef}
        {...handlers}
        role="dialog"
        aria-modal="true"
        aria-label={t("menu")}
        className="absolute top-0 left-0 flex h-full w-[88%] max-w-sm flex-col transition-transform duration-200"
        style={{
          background: "var(--surface)",
          transform: open
            ? dragOffset < 0
              ? `translateX(${dragOffset}px)`
              : "translateX(0)"
            : "translateX(-100%)",
          // Match the cart drawer: disable transition during drag so the drawer tracks
          // the finger 1:1, then snap back via the original transition on release.
          ...(dragOffset < 0 ? { transition: "none" } : {}),
        }}
      >
        <div className="flex h-14 items-center justify-between border-b border-black/10 px-4">
          <span className="label-eyebrow">{t("menu")}</span>
          <button
            type="button"
            onClick={onClose}
            aria-label={t("close")}
            className="-mr-2 flex h-10 w-10 items-center justify-center"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 py-6">
          <p className="label-eyebrow mb-3">{t("shop")}</p>
          <ul className="space-y-2 pb-6">
            {SHOP_LINKS.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  onClick={onClose}
                  className="font-display text-base tracking-tight transition-colors hover:text-[var(--color-brand-maroon)]"
                >
                  {t(l.labelKey)}
                </Link>
              </li>
            ))}
          </ul>

          <ul className="space-y-2 border-t border-black/10 pt-5">
            {SECONDARY.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  onClick={onClose}
                  className="text-xs uppercase tracking-[0.18em] transition-colors hover:text-[var(--color-brand-maroon)]"
                >
                  {t(l.labelKey)}
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-6 border-t border-black/10 pt-5">
            <p className="label-eyebrow mb-3">{t("needHelp")}</p>
            <a
              href={`https://wa.me/${whatsappNumber}`}
              target="_blank"
              rel="noreferrer noopener"
              onClick={onClose}
              className="flex items-center gap-3 rounded-md border border-black/10 px-3 py-2.5 transition-colors hover:border-black/30"
            >
              <span
                className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full"
                style={{ background: "#25D366", color: "white" }}
              >
                <WhatsAppIcon size={16} />
              </span>
              <span className="text-sm font-medium">{t("chatWhatsApp")}</span>
            </a>
          </div>

        </nav>
      </aside>
    </div>
  );
}
