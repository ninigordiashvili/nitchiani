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
 * The free-shipping promise is only made when the tenant has a threshold to back it. Without
 * one the strip states the delivery times instead — the same promise as the terms of service —
 * rather than advertising free delivery the shop hasn't set up.
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
      {/* Light tracking: the wide letter-spacing this strip used made a Georgian sentence run
          off a phone screen and harder to read anywhere. */}
      <div className="container-shop flex h-9 items-center justify-center gap-2 text-xs tracking-[0.04em] sm:h-8">
        <Truck size={12} className="opacity-80" />
        <span>
          {freeShippingThreshold !== null
            ? t("shipping", {
                amount: formatPrice(
                  { amount: freeShippingThreshold.toFixed(2), currencyCode: "GEL" },
                  locale as Locale,
                ),
              })
            : (
              <>
                {/* The full sentence doesn't fit a phone's width on one line. */}
                <span className="sm:hidden">{t("deliveryShort")}</span>
                <span className="hidden sm:inline">{t("delivery")}</span>
              </>
            )}
        </span>
      </div>
    </div>
  );
}
