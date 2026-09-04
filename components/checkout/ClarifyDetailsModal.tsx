"use client";

import { Facebook, Instagram, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useRef } from "react";
import { WhatsAppIcon, getWhatsAppNumber } from "@/components/brand/WhatsAppIcon";
import { chatChannels } from "@/lib/contact-channels";
import { useFocusTrap } from "@/lib/ui/use-focus-trap";
import { useToast } from "@/lib/ui/toast";

/**
 * Offered when the shopper picks bank transfer, which is the one method that can't complete
 * itself on the site: EchoDesk has no bank-transfer equivalent, so the order has to be
 * arranged with a person. Rather than let them fill the whole form and be told at the end
 * that it can't go through, we hand them a chat at the moment they choose it.
 *
 * The links open a conversation rather than a profile — `ig.me/m/…` and `m.me/…`, not the
 * page URLs in the footer. See `lib/contact-channels.ts`.
 *
 * Each one carries the opening message. WhatsApp takes it in the URL and the shopper only
 * has to press send; Instagram and Messenger accept no message parameter at all, so there it
 * is copied to the clipboard and the shopper pastes. That difference is theirs, not ours —
 * the alternative is a query string those apps silently drop, leaving an empty box and a
 * customer who has to compose the request themselves.
 *
 * They open in a new tab, so the checkout they were part-way through is still there when
 * they come back. Navigating the tab away would lose the form (the bag survives in storage,
 * the typed name and address don't).
 */
export function ClarifyDetailsModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const t = useTranslations();
  const toast = useToast();
  const modalRef = useRef<HTMLDivElement>(null);
  useFocusTrap(modalRef, open);

  const message = t("checkout.clarifyMessage");
  const channels = chatChannels(getWhatsAppNumber(), message);
  const icons = {
    whatsapp: <WhatsAppIcon size={22} />,
    instagram: <Instagram size={22} />,
    facebook: <Facebook size={22} />,
  } as const;

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  return (
    <div
      aria-hidden={!open}
      className="fixed inset-0 z-50 transition-opacity"
      style={{ opacity: open ? 1 : 0, pointerEvents: open ? "auto" : "none" }}
    >
      <div
        className="absolute inset-0"
        style={{ background: "rgba(10,31,31,0.55)" }}
        onClick={onClose}
      />
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-label={t("checkout.clarifyTitle")}
        className="absolute right-0 bottom-0 left-0 rounded-t-2xl transition-transform duration-200 ease-[var(--ease-brand)] sm:right-1/2 sm:bottom-1/2 sm:left-1/2 sm:w-[min(24rem,92vw)] sm:translate-x-[-50%] sm:translate-y-[50%] sm:rounded-2xl"
        style={{
          background: "var(--surface)",
          transform: open ? undefined : "translateY(100%)",
        }}
      >
        <div className="flex items-start justify-between gap-3 px-5 pt-5">
          <p className="font-display text-lg leading-snug">{t("checkout.clarifyTitle")}</p>
          <button
            type="button"
            onClick={onClose}
            aria-label={t("nav.close")}
            className="-mt-1 -mr-2 flex h-9 w-9 flex-shrink-0 cursor-pointer items-center justify-center"
          >
            <X size={18} />
          </button>
        </div>

        {/* The message is shown, not just sent: a shopper about to be dropped into a chat
            should be able to read what is going with them. */}
        <p className="mx-5 mt-3 rounded-md bg-black/[0.04] px-3 py-2 text-xs leading-relaxed opacity-80">
          “{message}”
        </p>

        <div className="grid grid-cols-3 gap-2 px-5 pt-4 pb-6">
          {channels.map((c) => (
            <a
              key={c.key}
              href={c.href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={async () => {
                if (!c.prefills) {
                  // Best effort: a blocked clipboard (insecure context, denied permission)
                  // must not stop the chat from opening — the shopper can still type.
                  try {
                    await navigator.clipboard.writeText(message);
                    toast.show(t("checkout.clarifyCopied"));
                  } catch {
                    // no-op
                  }
                }
                onClose();
              }}
              className="flex flex-col items-center gap-2 rounded-lg border border-black/10 px-2 py-4 transition-colors hover:border-[var(--color-brand-ink)] hover:bg-black/[0.03]"
            >
              {icons[c.key]}
              <span className="text-xs font-medium">{c.label}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
