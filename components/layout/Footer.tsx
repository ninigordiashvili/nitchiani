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
import { BUSINESS, BUSINESS_DETAILS_FILLED } from "@/lib/business";
import { useCookieConsent } from "@/lib/ui/cookie-consent";
// import { NewsletterForm } from "./NewsletterForm";  // hidden — see the footer body

export function Footer() {
  const t = useTranslations();
  const year = new Date().getFullYear();
  const whatsappNumber = getWhatsAppNumber();
  const instagramHandle = process.env.NEXT_PUBLIC_INSTAGRAM_HANDLE ?? "Nitchiani.shop";
  const phoneDisplay = formatWhatsAppNumber(whatsappNumber);
  const { reset: resetCookieConsent } = useCookieConsent();

  // One definition for both renderings below: mobile shows these as an icon row, desktop as a
  // labelled list. Two hand-maintained copies of the same five links would drift.
  const contactLinks = [
    { key: "phone", href: `tel:+${whatsappNumber}`, label: phoneDisplay, icon: <Phone size={16} />, external: false },
    { key: "email", href: `mailto:${BUSINESS.email}`, label: BUSINESS.email, icon: <Mail size={16} />, external: false },
    { key: "whatsapp", href: `https://wa.me/${whatsappNumber}`, label: t("nav.chatWhatsApp"), icon: <WhatsAppIcon size={16} />, external: true },
    { key: "instagram", href: `https://instagram.com/${instagramHandle}`, label: `@${instagramHandle}`, icon: <Instagram size={16} />, external: true },
    { key: "facebook", href: BUSINESS.facebookUrl, label: BUSINESS.facebookName, icon: <Facebook size={16} />, external: true },
  ];

  return (
    <footer
      className="mt-6 sm:mt-16"
      style={{ background: "var(--color-brand-bg)", color: "var(--color-brand-cream)" }}
    >
      {/* Bottom padding reserves room for the two things that float over the end of the page.
          Mobile: the fixed BottomNav (~64px + iOS safe-area inset).
          Desktop: the chat launcher, 56px at 20px from the corner, which the right-aligned
          payment line otherwise runs underneath — measured at 44px of overlap at 1280px.
          `sm:pb-24` clears it with room to spare, and keeps the row's alignment intact
          instead of shunting the text sideways. */}
      <div className="container-shop pt-10 pb-[calc(6rem+env(safe-area-inset-bottom))] sm:pb-24">
        {/* Newsletter signup — hidden for now. Uncomment this block (and the
            `NewsletterForm` import above) to bring it back; the divider below it
            belongs to this block, not to TrustStrip. */}
        {/*
        <NewsletterForm />
        <div className="my-10 border-t border-white/10" />
        */}
        <TrustStrip tone="dark" />
        <div className="my-10 border-t border-white/10" />
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Centred on mobile where it's the full width of the column and reads as a
              masthead; left-aligned from sm up where it sits in a grid beside the link lists. */}
          <div className="col-span-2 flex flex-col items-center gap-4 text-center sm:col-span-1 sm:items-start sm:text-left">
            <Logo variant="mark" size={72} />
            <p className="max-w-[28ch] text-sm opacity-70">{t("brand.tagline")}</p>

            {/* Mobile-only contact row. The labelled list below runs to six full-width rows,
                which is most of a phone screen; as icons it's one line and every target is
                44px. Labels move to aria-label so the links stay announced. */}
            <ul className="flex items-center justify-center gap-1 sm:hidden">
              {contactLinks.map((c) => (
                <li key={c.key}>
                  <a
                    href={c.href}
                    aria-label={c.label}
                    {...(c.external ? { target: "_blank", rel: "noreferrer noopener" } : {})}
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 opacity-80 transition-opacity hover:opacity-100"
                  >
                    {c.icon}
                  </a>
                </li>
              ))}
            </ul>
            <p className="flex items-center gap-1.5 text-xs opacity-60 sm:hidden">
              <MapPin size={13} className="opacity-70" />
              {t("footer.tbilisi")}
            </p>
          </div>

          {/* Desktop rendering of the same links — full labels, where there's room for them. */}
          <div className="hidden sm:block">
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

        {/* Business identification — legal entity name, registration ID, address, contact
            email. Required for Georgian e-commerce, so this stays in the codebase, but it is
            hidden until `lib/business.ts` holds real values: publishing "[LEGAL ENTITY NAME]"
            and "[REGISTRATION NUMBER]" to customers looks worse than showing nothing, and
            reads as an unfinished site rather than a registered business.
            `BUSINESS_DETAILS_FILLED` flips the moment the placeholders are replaced, so the
            block returns on its own — no code change needed at incorporation. */}
        {BUSINESS_DETAILS_FILLED ? (
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
        ) : null}

        <div className="mt-6 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-center text-xs opacity-60 sm:flex-row sm:items-center sm:text-left">
          <p>© {year} Nitchiani. {t("footer.rights")}.</p>
          {/* Card brands, not banks: EchoDesk picks the gateway, bank transfer is refused at
              checkout, and TBC isn't enabled on the tenant — naming any of them here would
              advertise payment methods a shopper can't actually use. Matches the trust strip. */}
          <p>Visa · Mastercard</p>
        </div>
      </div>
    </footer>
  );
}
