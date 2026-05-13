import { Truck } from "lucide-react";
import { getTranslations } from "next-intl/server";

/**
 * Single-message promo strip above the header. Used to cross-fade between two messages
 * every 4.5s, but two strings can't justify a carousel — users either read it on the first
 * paint or never. Now: static, server-rendered, slightly taller for comfortable mobile
 * reading, with a truck glyph anchoring the brand's shipping promise.
 *
 * The `promo.newDrop` translation key still exists in the dictionary for future use
 * (seasonal campaigns, sale weeks, etc.) — swap `t("shipping")` for whatever's active.
 */
export async function PromoStrip() {
  const t = await getTranslations("promo");

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
        <span>{t("shipping")}</span>
      </div>
    </div>
  );
}
