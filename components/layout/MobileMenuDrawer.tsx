"use client";

import { X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect } from "react";
import { Link } from "@/lib/i18n/routing";
import { LanguageToggle } from "./LanguageToggle";
import { CurrencyToggle } from "./CurrencyToggle";
import type { Locale } from "@/lib/i18n/config";

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
  const locale = useLocale() as Locale;

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
        className="absolute top-0 left-0 flex h-full w-[88%] max-w-sm flex-col transition-transform duration-300"
        style={{
          background: "var(--color-brand-cream)",
          transform: open ? "translateX(0)" : "translateX(-100%)",
        }}
      >
        <div className="flex h-14 items-center justify-between border-b border-black/10 px-4">
          <span className="label-eyebrow">{t("menu")}</span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
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

          {/* Language + currency switchers — only inside the drawer on mobile (header shows them on sm+). */}
          <div className="mt-8 space-y-4 border-t border-black/10 pt-5 sm:hidden">
            <div>
              <p className="label-eyebrow mb-2">{t("language")}</p>
              <LanguageToggle locale={locale} />
            </div>
            <div>
              <p className="label-eyebrow mb-2">{t("currency")}</p>
              <CurrencyToggle />
            </div>
          </div>
        </nav>
      </aside>
    </div>
  );
}
