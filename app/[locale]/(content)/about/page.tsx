import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Mail, MapPin, Phone } from "lucide-react";
import { localeAlternates } from "@/lib/seo";
import { BUSINESS, BUSINESS_DETAILS_FILLED } from "@/lib/business";
import { formatWhatsAppNumber, getWhatsAppNumber } from "@/components/brand/WhatsAppIcon";
import type { Locale } from "@/lib/i18n/config";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "about" });
  return {
    title: locale === "ka" ? "ჩვენ შესახებ" : "About",
    // The lead doubles as the meta description: it is the one sentence that says who the shop
    // is and what it sells, which is exactly what the description has to do.
    description: t("lead"),
    alternates: localeAlternates(locale, "/about"),
  };
}

export default async function AboutPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("about");
  // Same source the footer uses, so the two can't drift apart.
  const whatsappNumber = getWhatsAppNumber();
  // City only, deliberately. Collection happens at the owner's home, and this is the page
  // Google indexes — a street address here publishes a private residence to anyone who
  // searches, permanently. Checkout still shows the exact address, but only to someone who
  // has chosen collection, which is the moment they need it.
  //
  // `BUSINESS.address` is the registered *legal* address and would be fine to print; it is
  // still a placeholder awaiting the lawyer, so it only appears once filled in.
  const storeAddress = BUSINESS_DETAILS_FILLED
    ? BUSINESS.address
    : locale === "ka"
      ? "თბილისი, საქართველო"
      : "Tbilisi, Georgia";

  // Ordered as a first-time visitor's questions arrive: what is this, what do you sell, why
  // you, how does it reach me, what if it's wrong, how do I ask. Each is its own `h2` — the
  // page was a single centred paragraph, which gave search engines nothing to read and a
  // shopper no reason to trust an unfamiliar shop with a card number.
  const sections = [
    { title: t("offerTitle"), body: t("offerBody") },
    { title: t("whyTitle"), body: t("whyBody") },
    { title: t("deliveryTitle"), body: t("deliveryBody") },
    { title: t("returnsTitle"), body: t("returnsBody") },
  ];

  return (
    <div className="container-shop pb-16">
      <div className="mx-auto max-w-2xl py-6 sm:py-14">
        <header className="text-center">
          <p className="label-eyebrow mb-2">{locale === "ka" ? "ჩვენ შესახებ" : "About"}</p>
          <h1 className="font-display text-3xl tracking-tight sm:text-5xl">Nitchiani</h1>
          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed opacity-85">
            {t("lead")}
          </p>
        </header>

        <div className="mt-12 grid gap-9 sm:mt-14">
          {sections.map((s) => (
            <section key={s.title}>
              <h2 className="font-display mb-2 text-xl tracking-tight sm:text-2xl">{s.title}</h2>
              <p className="text-sm leading-relaxed opacity-85 sm:text-base">{s.body}</p>
            </section>
          ))}

          <section>
            <h2 className="font-display mb-3 text-xl tracking-tight sm:text-2xl">
              {t("contactTitle")}
            </h2>
            <ul className="grid gap-2 text-sm">
              {storeAddress ? (
                <li className="flex items-center gap-2.5">
                  <MapPin size={15} className="shrink-0 opacity-50" aria-hidden />
                  <span>{storeAddress}</span>
                </li>
              ) : null}
              <li className="flex items-center gap-2.5">
                <Phone size={15} className="shrink-0 opacity-50" aria-hidden />
                <a href={`tel:+${whatsappNumber}`} className="hover:underline">
                  {formatWhatsAppNumber(whatsappNumber)}
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail size={15} className="shrink-0 opacity-50" aria-hidden />
                <a href={`mailto:${BUSINESS.email}`} className="hover:underline">
                  {BUSINESS.email}
                </a>
              </li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
