import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Mail, MapPin, Phone } from "lucide-react";
import { localeAlternates } from "@/lib/seo";
import { Link } from "@/lib/i18n/routing";
import { BUSINESS, businessAddress } from "@/lib/business";
import { formatWhatsAppNumber, getWhatsAppNumber } from "@/components/brand/WhatsAppIcon";
import type { Locale } from "@/lib/i18n/config";
import { SITE_URL } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "about" });
  return {
    // Written for search results: the on-page heading is two words, and the lead runs past
    // the ~155 characters Google shows.
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: localeAlternates(locale, "/about"),
  };
}

export default async function AboutPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("about");
  // Same source the footer uses, so the two can't drift apart.
  const whatsappNumber = getWhatsAppNumber();
  // The registered address, published in full: card acquirers (TBC, via Flitt) require one on
  // the site before switching payments live, and the owner chose to show it.
  const storeAddress = businessAddress(locale);

  // Ordered as a first-time visitor's questions arrive: what is this, what do you sell, why
  // you, how does it reach me, what if it's wrong, how do I ask. Each is its own `h2` — the
  // page was a single centred paragraph, which gave search engines nothing to read and a
  // shopper no reason to trust an unfamiliar shop with a card number.
  // What the shop sells is the lead paragraph now, so it is not repeated as its own section.
  const sections = [
    { title: t("whyTitle"), body: t("whyBody") },
    { title: t("deliveryTitle"), body: t("deliveryBody", { address: BUSINESS.street[locale] }) },
    {
      title: t("returnsTitle"),
      body: t.rich("returnsBody", {
        link: (chunks) => (
          <Link href="/refund" className="underline underline-offset-2">
            {chunks}
          </Link>
        ),
      }),
    },
  ];

  // The questions a first-time buyer asks, answered once: shown on the page and published as
  // FAQPage structured data from the same strings, so the two cannot disagree. Google only
  // accepts FAQ markup for text that is visible on the page.
  const faqValues = {
    address: BUSINESS.street[locale],
    phone: formatWhatsAppNumber(whatsappNumber),
    email: BUSINESS.email,
  };
  const faqs = [1, 2, 3, 4, 5].map((i) => ({
    q: t(`faq${i}q`),
    a: t(`faq${i}a`, faqValues),
  }));
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${SITE_URL}/${locale}/about#faq`,
    inLanguage: locale === "ka" ? "ka-GE" : "en-US",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <div className="container-shop pb-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
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
            <h2 className="font-display mb-3 text-xl tracking-tight sm:text-2xl">{t("faqTitle")}</h2>
            <dl className="grid gap-4">
              {faqs.map((f) => (
                <div key={f.q}>
                  <dt className="text-sm font-semibold sm:text-base">{f.q}</dt>
                  <dd className="mt-1 text-sm leading-relaxed opacity-85 sm:text-base">{f.a}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section>
            <h2 className="font-display mb-3 text-xl tracking-tight sm:text-2xl">
              {t("contactTitle")}
            </h2>
            <p className="mb-4 text-sm leading-relaxed opacity-85 sm:text-base">
              {t("sellerBody", { name: BUSINESS.legalName[locale], id: BUSINESS.registrationId })}
            </p>
            <ul className="grid gap-2 text-sm">
              {storeAddress ? (
                <li className="flex items-center gap-2.5">
                  <MapPin size={15} className="shrink-0 opacity-50" aria-hidden />
                  <span>{storeAddress}</span>
                </li>
              ) : null}
              <li className="flex items-center gap-2.5">
                <Phone size={15} className="shrink-0 opacity-50" aria-hidden />
                <a href={`tel:+${whatsappNumber}`} className="group">
                  <span className="underline-motion">{formatWhatsAppNumber(whatsappNumber)}</span>
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail size={15} className="shrink-0 opacity-50" aria-hidden />
                <a href={`mailto:${BUSINESS.email}`} className="group">
                  <span className="underline-motion">{BUSINESS.email}</span>
                </a>
              </li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
