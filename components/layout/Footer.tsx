"use client";

import { Clock, MapPin, Phone } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/routing";
import {
  formatWhatsAppNumber,
  getWhatsAppNumber,
  WhatsAppIcon,
} from "@/components/brand/WhatsAppIcon";
import { Logo } from "@/components/brand/Logo";
import { TrustStrip } from "@/components/homepage/TrustStrip";
import { NewsletterForm } from "./NewsletterForm";

export function Footer() {
  const t = useTranslations();
  const year = new Date().getFullYear();
  const whatsappNumber = getWhatsAppNumber();
  const phoneDisplay = formatWhatsAppNumber(whatsappNumber);

  return (
    <footer
      className="mt-16"
      style={{ background: "var(--color-brand-bg)", color: "var(--color-brand-cream)" }}
    >
      <div className="container-shop pt-10 pb-12">
        <NewsletterForm />
        <div className="my-10 border-t border-white/10" />
        <TrustStrip tone="dark" />
        <div className="my-10 border-t border-white/10" />
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            <Logo variant="mark" size={64} />
            <p className="text-sm opacity-70">{t("brand.tagline")}</p>
          </div>

          <div>
            <p className="label-eyebrow mb-4 text-[var(--color-brand-silver)]">
              {t("footer.contact")}
            </p>
            <ul className="space-y-2.5 text-sm opacity-85">
              <li className="flex items-start gap-2">
                <MapPin size={14} className="mt-0.5 flex-shrink-0 opacity-70" />
                <span>{t("footer.address")}</span>
              </li>
              <li>
                <a
                  href={`tel:+${whatsappNumber}`}
                  className="flex items-center gap-2 tabular-nums hover:opacity-100"
                >
                  <Phone size={14} className="flex-shrink-0 opacity-70" />
                  <span>{phoneDisplay}</span>
                </a>
              </li>
              <li>
                <a
                  href={`https://wa.me/${whatsappNumber}`}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-center gap-2 hover:opacity-100"
                >
                  <WhatsAppIcon size={14} />
                  <span>{t("nav.chatWhatsApp")}</span>
                </a>
              </li>
              <li className="flex items-start gap-2 pt-1 text-xs opacity-70">
                <Clock size={13} className="mt-0.5 flex-shrink-0" />
                <span>
                  {t("footer.weekdays")}
                  <br />
                  {t("footer.sunday")}
                </span>
              </li>
            </ul>
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
