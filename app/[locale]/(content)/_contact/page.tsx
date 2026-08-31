import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Facebook, Instagram, MessageCircle, Mail, MapPin, Phone } from "lucide-react";
import { localeAlternates } from "@/lib/seo";
import { formatWhatsAppNumber, getWhatsAppNumber } from "@/components/brand/WhatsAppIcon";
import { BUSINESS } from "@/lib/business";
import type { Locale } from "@/lib/i18n/config";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "nav" });
  const description =
    locale === "ka"
      ? "დაგვიკავშირდით — ტელეფონი, WhatsApp, Instagram, Facebook ან ელფოსტა. თბილისი, საქართველო."
      : "Get in touch with Nitchiani — phone, WhatsApp, Instagram, Facebook or email. Tbilisi, Georgia.";
  return {
    title: t("contact"),
    description,
    alternates: localeAlternates(locale, "/contact"),
  };
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("nav");

  const wa = getWhatsAppNumber();
  const phoneDisplay = formatWhatsAppNumber(wa);
  const ig = process.env.NEXT_PUBLIC_INSTAGRAM_HANDLE ?? "Nitchiani.shop";

  return (
    <div className="container-shop pb-12">
      <div className="max-w-2xl">
        <h1 className="font-display text-3xl tracking-tight sm:text-5xl">{t("contact")}</h1>
        <ul className="mt-8 space-y-4 text-sm">
        <li className="flex items-center gap-3">
          <MapPin size={18} className="opacity-60" />
          {locale === "ka" ? "თბილისი, საქართველო" : "Tbilisi, Georgia"}
        </li>
        <li>
          <a
            href={`tel:+${wa}`}
            className="flex items-center gap-3 tabular-nums hover:opacity-80"
          >
            <Phone size={18} className="opacity-60" />
            {phoneDisplay}
          </a>
        </li>
        <li>
          <a href={`https://wa.me/${wa}`} className="flex items-center gap-3 hover:opacity-80">
            <MessageCircle size={18} className="opacity-60" />
            WhatsApp
          </a>
        </li>
        <li>
          <a
            href={`https://instagram.com/${ig}`}
            target="_blank"
            rel="noreferrer noopener"
            className="flex items-center gap-3 hover:opacity-80"
          >
            <Instagram size={18} className="opacity-60" />@{ig}
          </a>
        </li>
        <li>
          <a
            href={BUSINESS.facebookUrl}
            target="_blank"
            rel="noreferrer noopener"
            className="flex items-center gap-3 hover:opacity-80"
          >
            <Facebook size={18} className="opacity-60" />
            {BUSINESS.facebookName}
          </a>
        </li>
        <li>
          <a href={`mailto:${BUSINESS.email}`} className="flex items-center gap-3 hover:opacity-80">
            <Mail size={18} className="opacity-60" />
            {BUSINESS.email}
          </a>
        </li>
        </ul>
      </div>
    </div>
  );
}
