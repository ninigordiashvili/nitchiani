import { Facebook, Instagram, Mail, Phone } from "lucide-react";
import { getTranslations } from "next-intl/server";
import {
  formatWhatsAppNumber,
  getWhatsAppNumber,
  WhatsAppIcon,
} from "@/components/brand/WhatsAppIcon";
import { BUSINESS } from "@/lib/business";

/**
 * Closes the homepage on the five ways to reach the studio, as large icon tiles.
 *
 * Replaces the old Instagram photo grid: the strip's job is now "start a conversation",
 * not "show the feed". Tiles reuse the card treatment from `ReviewsRail` — elevated
 * surface, hairline border that darkens on hover — so the row reads as part of the same
 * system rather than a bolt-on social bar.
 *
 * Every destination is the same value the footer and /contact use, so there is one source
 * of truth per channel.
 */
export async function ConnectStrip() {
  const t = await getTranslations("home");
  const tc = await getTranslations("contact");

  const handle = process.env.NEXT_PUBLIC_INSTAGRAM_HANDLE ?? "Nitchiani.shop";
  const whatsapp = getWhatsAppNumber();

  const channels = [
    {
      key: "instagram",
      href: `https://instagram.com/${handle}`,
      label: tc("instagramLabel"),
      detail: `@${handle}`,
      icon: <Instagram size={30} strokeWidth={1.5} />,
      external: true,
    },
    {
      key: "whatsapp",
      href: `https://wa.me/${whatsapp}`,
      label: tc("whatsappLabel"),
      detail: formatWhatsAppNumber(whatsapp),
      // The brand glyph rather than a generic bubble — a chat CTA only reads as WhatsApp
      // if it looks like WhatsApp. Sized down 2px against the stroked icons, whose solid
      // fill would otherwise carry more optical weight at this size.
      icon: <WhatsAppIcon size={28} />,
      external: true,
    },
    {
      key: "facebook",
      href: BUSINESS.facebookUrl,
      label: tc("facebookLabel"),
      detail: BUSINESS.facebookName,
      icon: <Facebook size={30} strokeWidth={1.5} />,
      external: true,
    },
    {
      key: "email",
      href: `mailto:${BUSINESS.email}`,
      label: tc("emailLabel"),
      detail: BUSINESS.email,
      icon: <Mail size={30} strokeWidth={1.5} />,
      external: false,
    },
    {
      key: "phone",
      href: `tel:+${whatsapp}`,
      label: tc("phoneLabel"),
      detail: formatWhatsAppNumber(whatsapp),
      icon: <Phone size={30} strokeWidth={1.5} />,
      external: false,
    },
  ];

  return (
    <section>
      <div className="mb-5">
        <p className="label-eyebrow mb-1.5">{t("connectEyebrow")}</p>
        <h2 className="font-display text-2xl tracking-tight sm:text-3xl">
          {t("connectTitle")}
        </h2>
        <p className="mt-2 max-w-md text-sm opacity-70">{t("connectDesc")}</p>
      </div>

      {/* 3-up on mobile so the row never shrinks the tiles below a comfortable tap
          target; 5-up from `sm:` where all five fit on one line. */}
      <ul className="grid grid-cols-3 gap-2 sm:grid-cols-5 sm:gap-3">
        {channels.map((c) => (
          <li key={c.key}>
            <a
              href={c.href}
              {...(c.external
                ? { target: "_blank", rel: "noreferrer noopener" }
                : {})}
              aria-label={`${c.label} — ${c.detail}`}
              className="group flex h-full flex-col items-center justify-center gap-2.5 rounded-lg border border-black/10 px-2 py-7 transition-colors hover:border-black/30 sm:py-9"
              style={{ background: "var(--surface-elevated)" }}
            >
              <span className="text-[var(--text-primary)] transition-colors group-hover:text-[var(--color-brand-maroon)]">
                {c.icon}
              </span>
              <span className="text-[11px] font-medium tracking-[0.14em] uppercase">
                {c.label}
              </span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
