import { Truck } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import type { Locale } from "@/lib/i18n/config";
import { formatPrice } from "@/lib/money";

/**
 * Single-message promo strip above the header. Used to cross-fade between two messages
 * every 4.5s, but two strings can't justify a carousel — users either read it on the first
 * paint or never. Now: static, server-rendered, slightly taller for comfortable mobile
 * reading, with a truck glyph anchoring the brand's shipping promise.
 *
 * The shipping promise is only made when the tenant has a free-shipping threshold to back it.
 * With none configured the strip falls back to `promo.newDrop` rather than advertising free
 * delivery the shop hasn't set up — and rather than leaving an empty bar above the header.
 */
export async function PromoStrip({
  freeShippingThreshold,
}: {
  freeShippingThreshold: number | null;
}) {
  const t = await getTranslations("promo");
  const locale = await getLocale();

  return (
    <div
      className="w-full"
      style={{
        background: "var(--color-brand-bg)",
        color: "var(--color-brand-cream)",
      }}
    >
      <div className="container-shop flex h-8 items-center justify-center gap-2 text-[11px] tracking-[0.18em] uppercase">
        <Truck size={12} className="opacity-80" />
        <span>
          {freeShippingThreshold !== null
            ? t("shipping", {
                amount: formatPrice(
                  { amount: freeShippingThreshold.toFixed(2), currencyCode: "GEL" },
                  locale as Locale,
                ),
              })
            : t("newDrop")}
        </span>
      </div>
    </div>
  );
}
