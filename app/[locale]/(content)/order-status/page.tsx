import { ClipboardCheck, Package, RotateCcw, Truck } from "lucide-react";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { WhatsAppIcon, getWhatsAppNumber } from "@/components/brand/WhatsAppIcon";
import type { Locale } from "@/lib/i18n/config";

/**
 * Static order-tracking explainer. The studio doesn't ship live shipment-status data yet
 * (tracking is communicated via WhatsApp / email by the merchant), so this page exists as
 * a trust anchor: a Georgian shopper who's bought once knows there's a real URL to find
 * the answer to "where's my order?" without rummaging through emails.
 *
 * When real shipment tracking lands (Shopify Order API + courier webhooks), this page
 * becomes the surface for the live status — the layout stays, the static timeline becomes
 * dynamic.
 */
export default async function OrderStatusPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<{ order?: string }>;
}) {
  const { locale } = await params;
  const { order } = await searchParams;
  setRequestLocale(locale);

  const [t, tCart, tCheckout] = await Promise.all([
    getTranslations("orderStatus"),
    getTranslations("cart"),
    getTranslations("checkout"),
  ]);

  const whatsappNumber = getWhatsAppNumber();
  const message = order
    ? `Hi — checking on order #${order}`
    : "Hi — checking on my order";
  const whatsappHref = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

  const steps = [
    { icon: ClipboardCheck, text: tCart("howItWorksStep1Title") },
    { icon: Package, text: tCart("howItWorksStep2Title") },
    { icon: Truck, text: tCart("howItWorksStep3Title") },
    { icon: RotateCcw, text: tCart("howItWorksStep4Title") },
  ];

  return (
    <div className="container-shop py-8 sm:py-12">
      <header className="mb-8 max-w-2xl">
        <p className="label-eyebrow mb-2">{t("eyebrow")}</p>
        {order ? (
          <p className="mb-3 text-xs tabular-nums opacity-60">
            {tCheckout("orderNumber", { id: order })}
          </p>
        ) : null}
        <h1 className="font-display text-3xl leading-tight tracking-tight sm:text-4xl">
          {t("title")}
        </h1>
        <p className="mt-4 text-sm opacity-80 sm:text-base">{t("intro")}</p>
      </header>

      {/* Static timeline — same vocabulary as the "How it works" modal */}
      <ol className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((step, i) => (
          <li
            key={i}
            className="flex items-start gap-3 rounded-md border border-black/10 p-4"
          >
            <span
              className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full"
              style={{
                background:
                  "color-mix(in oklab, var(--color-brand-maroon) 10%, transparent)",
                color: "var(--color-brand-maroon)",
              }}
            >
              <step.icon size={16} />
            </span>
            <div>
              <p className="text-[11px] tabular-nums opacity-50">0{i + 1}</p>
              <p className="text-sm font-medium leading-tight">{step.text}</p>
            </div>
          </li>
        ))}
      </ol>

      {/* WhatsApp CTA — the actual "track my order" path until a live tracking system lands */}
      <div className="rounded-lg border border-black/10 p-5 sm:p-6">
        <p className="label-eyebrow mb-2">{t("contactEyebrow")}</p>
        <p className="font-display text-xl tracking-tight sm:text-2xl">
          {t("contactTitle")}
        </p>
        <p className="mt-2 max-w-md text-sm opacity-75">{t("contactDesc")}</p>
        <a
          href={whatsappHref}
          target="_blank"
          rel="noreferrer noopener"
          className="btn-primary mt-5"
        >
          <WhatsAppIcon size={16} />
          {t("openWhatsApp")}
        </a>
      </div>
    </div>
  );
}
