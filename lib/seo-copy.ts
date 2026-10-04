import type { Locale } from "@/lib/i18n/config";

/**
 * The title and description search engines show, per locale.
 *
 * Separate from `lib/i18n/messages/*.json` because these are not UI strings: they are never
 * rendered on the page, they are written to a length (a title over ~60 characters is cut off
 * mid-word in results, a description over ~160 likewise), and they are the one piece of copy
 * chosen for what people type into Google rather than for how it reads on screen.
 *
 * The Georgian copy leads with the products, not the studio: the shop sells hair, and the
 * braiding service is no longer offered. It also spends its words on the phrases customers
 * actually search — "ხელოვნური თმა", "ხუჭუჭები", "ნაწნავები" — rather than
 * on the in-house vocabulary used elsewhere on the site.
 */
type SeoCopy = { title: string; description: string };

const COPY: Record<Locale, SeoCopy> = {
  ka: {
    title: "ხელოვნური თმა ხუჭუჭებისა და ნაწნავებისთვის — Nitchiani",
    description:
      "ხელოვნური თმა ხუჭუჭებისა და ნაწნავებისთვის, ატლასის ბონეტები, დურაგები და თმის მოვლის საშუალებები. მიწოდება მთელ საქართველოში ან უფასო გატანა თბილისში.",
  },
  en: {
    title: "Nitchiani — Synthetic Hair, Bonnets & Durags · Tbilisi",
    description:
      "Synthetic hair for afro curls, kinky and braiding textures, plus hair care, satin bonnets and durags. Delivery across Georgia or free pickup in Tbilisi.",
  },
};

export function seoCopy(locale: Locale): SeoCopy {
  return COPY[locale] ?? COPY.en;
}
