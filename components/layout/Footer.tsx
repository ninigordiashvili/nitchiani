"use client";

import { Facebook, Instagram, Mail, MapPin, Phone } from "lucide-react";
import { useTranslations } from "next-intl";
import { CATEGORIES } from "@/lib/categories";
import { Link } from "@/lib/i18n/routing";
import {
  formatWhatsAppNumber,
  getWhatsAppNumber,
  WhatsAppIcon,
} from "@/components/brand/WhatsAppIcon";
import { Logo } from "@/components/brand/Logo";
import { TrustStrip } from "@/components/homepage/TrustStrip";
import { BUSINESS } from "@/lib/business";
import { useCookieConsent } from "@/lib/ui/cookie-consent";
// import { NewsletterForm } from "./NewsletterForm";  // hidden — see the footer body

export function Footer() {
  const t = useTranslations();
  const year = new Date().getFullYear();
  const whatsappNumber = getWhatsAppNumber();
  const instagramHandle = process.env.NEXT_PUBLIC_INSTAGRAM_HANDLE ?? "Nitchiani.shop";
  const phoneDisplay = formatWhatsAppNumber(whatsappNumber);
  const { reset: resetCookieConsent } = useCookieConsent();

  return (
    <footer
      className="mt-6 sm:mt-16"
      style={{ background: "var(--color-brand-bg)", color: "var(--color-brand-cream)" }}
    >
      {/* Mobile only: reserve room below the copyright line so the fixed BottomNav
          (~64px content + iOS safe-area inset) doesn't cover the bottom of the footer.
          `sm:pb-12` resets this on desktop where BottomNav is hidden. */}
      <div className="container-shop pt-10 pb-[calc(6rem+env(safe-area-inset-bottom))] sm:pb-12">
        {/* Newsletter signup — hidden for now. Uncomment this block (and the
            `NewsletterForm` import above) to bring it back; the divider below it
            belongs to this block, not to TrustStrip. */}
        {/*
        <NewsletterForm />
        <div className="my-10 border-t border-white/10" />
        */}
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
                <span>{t("footer.tbilisi")}</span>
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
                  href={`mailto:${BUSINESS.email}`}
                  className="flex items-center gap-2 hover:opacity-100"
                >
                  <Mail size={14} className="flex-shrink-0 opacity-70" />
                  <span>{BUSINESS.email}</span>
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
              <li>
                <a
                  href={`https://instagram.com/${instagramHandle}`}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="flex items-center gap-2 hover:opacity-100"
                >
                  <Instagram size={14} className="flex-shrink-0 opacity-70" />
                  <span>@{instagramHandle}</span>
                </a>
              </li>
              <li>
                <a
                  href={BUSINESS.facebookUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="flex items-center gap-2 hover:opacity-100"
                >
                  <Facebook size={14} className="flex-shrink-0 opacity-70" />
                  <span>{BUSINESS.facebookName}</span>
                </a>
              </li>
            </ul>
          </div>

          <div>
            <p className="label-eyebrow mb-4 text-[var(--color-brand-silver)]">
              {t("footer.shop")}
            </p>
            <ul className="space-y-2 text-sm opacity-80">
              <li><Link href="/shop/new-arrivals">{t("nav.newArrivals")}</Link></li>
              {CATEGORIES.map((c) => (
                <li key={c.handle}>
                  <Link href={`/shop/${c.handle}`}>{t(`nav.${c.labelKey}`)}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="label-eyebrow mb-4 text-[var(--color-brand-silver)]">
              {t("footer.help")}
            </p>
            <ul className="space-y-2 text-sm opacity-80">
              {/* <li><Link href="/services">{t("nav.services")}</Link></li> */}
              {/* <li><Link href="/journal">{t("nav.journal")}</Link></li> */}
              <li><Link href="/about">{t("nav.about")}</Link></li>
              {/* <li><Link href="/contact">{t("nav.contact")}</Link></li> */}
              <li><Link href="/order-status">{t("nav.orderStatus")}</Link></li>
              <li><Link href="/terms">{t("nav.terms")}</Link></li>
              <li><Link href="/privacy">{t("nav.privacy")}</Link></li>
              <li><Link href="/refund">{t("nav.refund")}</Link></li>
              <li>
                <button
                  type="button"
                  onClick={resetCookieConsent}
                  className="cursor-pointer text-left hover:opacity-100"
                >
                  {t("nav.cookiePreferences")}
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Business identification — required for Georgian e-commerce (legal entity name,
            registration ID, address, contact email). Pulled from `lib/business.ts`. */}
        <div className="mt-10 border-t border-white/10 pt-6 text-[11px] leading-relaxed opacity-55 sm:text-xs">
          <p className="font-medium opacity-90">{BUSINESS.legalName}</p>
          <p>
            {t("footer.regId")}: <span className="tabular-nums">{BUSINESS.registrationId}</span>
            {BUSINESS.vatId ? (
              <>
                {" · "}
                {t("footer.vatId")}: <span className="tabular-nums">{BUSINESS.vatId}</span>
              </>
            ) : null}
          </p>
          <p>{BUSINESS.address}</p>
          <p>
            <a href={`mailto:${BUSINESS.email}`} className="underline-offset-2 hover:underline">
              {BUSINESS.email}
            </a>
          </p>
        </div>

        <div className="mt-6 flex flex-col items-start justify-between gap-3 border-t border-white/10 pt-6 text-xs opacity-60 sm:flex-row sm:items-center">
          <p>© {year} Nitchiani. {t("footer.rights")}.</p>
          <p>BOG · TBC · Bank transfer</p>
        </div>
      </div>
    </footer>
  );
}
