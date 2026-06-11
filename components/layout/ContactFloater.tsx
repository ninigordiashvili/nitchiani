"use client";

import { Instagram, Mail, MessageCircle, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { WhatsAppIcon, getWhatsAppNumber } from "@/components/brand/WhatsAppIcon";
import { BUSINESS } from "@/lib/business";
import { useOverlays } from "@/lib/ui/overlays";

/**
 * Combined contact floater. Replaces the previous pair (WhatsAppFloater + InstagramFloater)
 * which stacked two icons permanently in the bottom-right.
 *
 *   - Collapsed: a single circular trigger (chat icon) in the corner.
 *   - Expanded:  a small card slides up listing WhatsApp / Instagram / email, each with a
 *                one-line subtitle.
 *   - Closing the card: × inside the card, Escape, or a click outside. All three just
 *                collapse back to the trigger button — the floater itself is always present.
 *
 * Stays out of the way during the PDP sticky Add-to-bag (via `pdpCtaActive`) so it doesn't
 * crowd the primary CTA on a product page.
 *
 * Legacy `nitchiani:contact-floater-dismissed` sessionStorage flag (from a previous
 * "dismiss for session" iteration) is proactively cleared on mount so users who closed the
 * floater under the old behaviour don't stay stuck without it.
 */

const LEGACY_DISMISS_KEY = "nitchiani:contact-floater-dismissed";

export function ContactFloater() {
  const t = useTranslations("contact");
  const { pdpCtaActive } = useOverlays();
  const [open, setOpen] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Clean up the legacy session flag so anyone who tried the previous "dismiss for session"
  // build doesn't see a permanently-missing floater after this update.
  useEffect(() => {
    try {
      sessionStorage.removeItem(LEGACY_DISMISS_KEY);
    } catch {
      // best-effort — private mode etc.
    }
  }, []);

  // Escape closes the panel.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // Outside-click closes the panel. Trigger has its own onClick so its tap is filtered out.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (cardRef.current && !cardRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const whatsappNumber = getWhatsAppNumber();
  const instagramHandle = process.env.NEXT_PUBLIC_INSTAGRAM_HANDLE ?? "nitchiani";

  // Mobile: lift just above the BottomNav (4.5rem) + iOS safe-area. Desktop (sm+): handled
  // by the `sm:bottom-2` class which overrides this value.
  const baseBottomStyle = {
    bottom: "calc(4.5rem + env(safe-area-inset-bottom))",
  };

  return (
    <div
      // The whole assembly fades + slides when the PDP sticky CTA is up. Same gesture as
      // the previous two floaters had — keeps the PDP focused on Add-to-bag.
      //
      // `flex flex-col items-end` pins both the card (panel) and the trigger button to the
      // right edge of the wrapper. Without `items-end`, the wider card stretches the wrapper
      // and the narrower trigger button drifts to the left when the panel opens.
      aria-hidden={pdpCtaActive}
      className="pointer-events-none fixed right-2 z-30 flex flex-col items-end transition-all sm:bottom-2"
      style={{
        ...baseBottomStyle,
        opacity: pdpCtaActive ? 0 : 1,
        transform: pdpCtaActive ? "translateY(20px) scale(0.9)" : undefined,
      }}
    >
      {open ? (
        <div
          ref={cardRef}
          role="dialog"
          aria-label={t("title")}
          // pointer-events restored on the card so taps register; parent wrapper is `none`.
          className="pointer-events-auto mb-3 w-72 max-w-[calc(100vw-2rem)] rounded-lg border p-4 shadow-xl sm:p-5"
          style={{
            background: "var(--surface-elevated)",
            borderColor: "var(--border-soft)",
          }}
        >
          <div className="mb-3 flex items-center justify-between">
            <p className="font-display text-base leading-tight">{t("title")}</p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label={t("close")}
              className="-mr-1 -mt-1 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full opacity-60 transition-opacity hover:opacity-100"
            >
              <X size={16} />
            </button>
          </div>

          <ul className="space-y-1">
            <ContactRow
              href={`https://wa.me/${whatsappNumber}`}
              icon={
                <span
                  className="flex h-9 w-9 items-center justify-center rounded-full"
                  style={{ background: "#25D366", color: "white" }}
                >
                  <WhatsAppIcon size={18} />
                </span>
              }
              label={t("whatsappLabel")}
              subtitle={t("whatsappDesc")}
            />
            <ContactRow
              href={`https://instagram.com/${instagramHandle}`}
              icon={
                <span
                  className="flex h-9 w-9 items-center justify-center rounded-full text-white"
                  style={{
                    background:
                      "linear-gradient(135deg,#feda75,#fa7e1e 25%,#d62976 50%,#962fbf 75%,#4f5bd5)",
                  }}
                >
                  <Instagram size={16} />
                </span>
              }
              label={t("instagramLabel")}
              subtitle={`@${instagramHandle}`}
            />
            <ContactRow
              href={`mailto:${BUSINESS.email}`}
              external={false}
              icon={
                <span
                  className="flex h-9 w-9 items-center justify-center rounded-full"
                  style={{ background: "var(--color-brand-ink)", color: "var(--color-brand-cream)" }}
                >
                  <Mail size={16} />
                </span>
              }
              label={t("emailLabel")}
              subtitle={BUSINESS.email}
            />
          </ul>
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? t("close") : t("open")}
        aria-expanded={open}
        className="pointer-events-auto flex h-14 w-14 cursor-pointer items-center justify-center rounded-full shadow-lg transition-transform hover:scale-105"
        style={{
          background: "var(--color-brand-ink)",
          color: "var(--color-brand-cream)",
        }}
      >
        {open ? <X size={22} /> : <MessageCircle size={22} />}
      </button>
    </div>
  );
}

function ContactRow({
  href,
  icon,
  label,
  subtitle,
  external = true,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  subtitle: string;
  external?: boolean;
}) {
  return (
    <li>
      <a
        href={href}
        {...(external ? { target: "_blank", rel: "noreferrer noopener" } : {})}
        className="-mx-1 flex items-center gap-3 rounded-md px-1 py-2 transition-colors hover:bg-black/5"
      >
        {icon}
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium leading-tight">{label}</p>
          <p className="truncate text-xs opacity-65">{subtitle}</p>
        </div>
      </a>
    </li>
  );
}
