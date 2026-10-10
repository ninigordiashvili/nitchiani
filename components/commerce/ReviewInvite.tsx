import { MessageCircle } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { getWhatsAppNumber } from "@/components/brand/WhatsAppIcon";

/**
 * Asks a customer whose order has arrived to say how it went.
 *
 * It points at WhatsApp rather than a form, because EchoDesk only accepts a review from a
 * logged-in customer and this storefront checks out as a guest — so the honest route is the
 * one the shop already uses to talk to people, and the merchant enters what they say.
 *
 * Shown only from "shipped" onwards: asking someone to review a parcel they haven't opened
 * is how you earn a review of the delivery.
 */
export async function ReviewInvite({ orderNumber }: { orderNumber?: string | null }) {
  const t = await getTranslations("orderStatus");
  const prefill = t("reviewPrefill", { order: orderNumber ?? "" }).trim();
  const href = `https://wa.me/${getWhatsAppNumber()}?text=${encodeURIComponent(prefill)}`;

  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--border-card)] p-4 sm:p-5">
      <p className="font-display text-lg tracking-tight">{t("reviewTitle")}</p>
      <p className="mt-1 max-w-prose text-sm opacity-70">{t("reviewDesc")}</p>
      <a
        href={href}
        target="_blank"
        rel="noreferrer noopener"
        className="mt-3 inline-flex items-center gap-2 rounded-full px-4 py-2 text-[13px] font-medium transition-opacity hover:opacity-90"
        style={{
          background: "var(--color-brand-maroon)",
          color: "var(--color-brand-cream)",
        }}
      >
        <MessageCircle size={15} aria-hidden />
        {t("reviewCta")}
      </a>
    </div>
  );
}
