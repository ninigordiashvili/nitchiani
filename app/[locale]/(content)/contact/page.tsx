import { setRequestLocale, getTranslations } from "next-intl/server";
import { Instagram, MessageCircle, Mail, MapPin } from "lucide-react";
import type { Locale } from "@/lib/i18n/config";

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("nav");

  const wa = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "995555000000";
  const ig = process.env.NEXT_PUBLIC_INSTAGRAM_HANDLE ?? "nitchiani";

  return (
    <div className="container-shop max-w-2xl py-12">
      <h1 className="font-display text-3xl tracking-tight sm:text-5xl">{t("contact")}</h1>
      <ul className="mt-8 space-y-4 text-sm">
        <li className="flex items-center gap-3">
          <MapPin size={18} className="opacity-60" />
          {locale === "ka" ? "თბილისი, საქართველო" : "Tbilisi, Georgia"}
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
          <a href="mailto:hello@nitchiani.com" className="flex items-center gap-3 hover:opacity-80">
            <Mail size={18} className="opacity-60" />
            hello@nitchiani.com
          </a>
        </li>
      </ul>
    </div>
  );
}
