import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { getWhatsAppNumber, WhatsAppIcon } from "@/components/brand/WhatsAppIcon";

/**
 * Inline "Ask on WhatsApp" CTA shown on the PDP, right under the trust strip.
 * Catches the hesitant Georgian shopper who's about to bounce because they have a
 * sizing/length/quality question and don't want to email or fill a contact form.
 *
 * Pre-fills the message with the product title so the studio knows what's being asked about.
 */
export function ProductHelpCard({ productTitle }: { productTitle: string }) {
  const t = useTranslations("product");
  const number = getWhatsAppNumber();
  const message = encodeURIComponent(`Hi! I have a question about: ${productTitle}`);
  const href = `https://wa.me/${number}?text=${message}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      className="mt-6 flex items-center gap-3 rounded-md border border-black/10 px-4 py-3 transition-colors hover:border-black/30"
      style={{ background: "color-mix(in oklab, #25D366 6%, transparent)" }}
    >
      <span
        className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full"
        style={{ background: "#25D366", color: "white" }}
      >
        <WhatsAppIcon size={18} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium leading-tight">{t("askQuestion")}</p>
        <p className="mt-0.5 text-xs opacity-70">{t("askQuestionDesc")}</p>
      </div>
      <ArrowRight size={16} className="flex-shrink-0 opacity-50" />
    </a>
  );
}
