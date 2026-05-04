"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/routing";
import { Logo } from "@/components/brand/Logo";
import { TrustStrip } from "@/components/homepage/TrustStrip";

export function Footer() {
  const t = useTranslations();
  const year = new Date().getFullYear();

  return (
    <footer
      className="mt-16"
      style={{ background: "var(--color-brand-bg)", color: "var(--color-brand-cream)" }}
    >
      <div className="container-shop pt-10 pb-12">
        <TrustStrip tone="dark" />
        <div className="my-10 border-t border-white/10" />
        <div className="grid gap-10 sm:grid-cols-3">
          <div className="space-y-5">
            <Logo variant="mark" size={64} />
            <p className="text-sm opacity-70">{t("brand.tagline")}</p>
            <p className="text-xs opacity-60">{t("footer.tbilisi")}</p>
          </div>

          <div>
            <p className="label-eyebrow mb-4 text-[var(--color-brand-silver)]">
              {t("footer.shop")}
            </p>
            <ul className="space-y-2 text-sm opacity-80">
              <li><Link href="/shop/best-sellers">{t("nav.bestSellers")}</Link></li>
              <li><Link href="/shop/new-arrivals">{t("nav.newArrivals")}</Link></li>
              <li><Link href="/shop/bonnets">{t("nav.bonnets")}</Link></li>
              <li><Link href="/shop/loc-care">{t("nav.locCare")}</Link></li>
              <li><Link href="/shop/extensions">{t("nav.extensions")}</Link></li>
            </ul>
          </div>

          <div>
            <p className="label-eyebrow mb-4 text-[var(--color-brand-silver)]">
              {t("footer.help")}
            </p>
            <ul className="space-y-2 text-sm opacity-80">
              <li><Link href="/services">{t("nav.services")}</Link></li>
              <li><Link href="/about">{t("nav.about")}</Link></li>
              <li><Link href="/contact">{t("nav.contact")}</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-white/10 pt-6 text-xs opacity-60 sm:flex-row sm:items-center">
          <p>© {year} Nitchiani. {t("footer.rights")}.</p>
          <p>BOG · TBC · Bank transfer</p>
        </div>
      </div>
    </footer>
  );
}
