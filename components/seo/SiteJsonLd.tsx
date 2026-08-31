import { BUSINESS } from "@/lib/business";
import { SITE_URL } from "@/lib/seo";
import type { Locale } from "@/lib/i18n/config";

/**
 * Site-wide structured data, emitted once per page from the locale layout.
 *
 * - `HairSalon` (a `LocalBusiness` subtype) is the single business entity: it doubles as the
 *   brand node Google needs for a knowledge panel (name, logo, social profiles) AND the local
 *   node that powers Maps / "braids near me" / local-pack results for the physical Tbilisi
 *   studio. Using one well-formed node beats two thin, competing ones.
 * - `WebSite` declares the site name for sitelinks. No `SearchAction` — search is a client-side
 *   overlay with no canonical results URL, and pointing the box at a dead endpoint hurts.
 *
 * Both render as non-hydrating server `<script>` tags (no client cost).
 */
export function SiteJsonLd({ locale }: { locale: Locale }) {
  const instagram = process.env.NEXT_PUBLIC_INSTAGRAM_HANDLE ?? "Nitchiani.shop";
  const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "995579370374";

  // Only assert a street address once the placeholder in lib/business.ts has been replaced;
  // locality + country are always safe. Add `geo` coordinates here once the real address lands.
  const hasStreet = !BUSINESS.address.startsWith("[");

  const business = {
    "@context": "https://schema.org",
    "@type": "HairSalon",
    "@id": `${SITE_URL}/#business`,
    name: "Nitchiani",
    url: SITE_URL,
    logo: `${SITE_URL}/icon.png`,
    image: `${SITE_URL}/icon.png`,
    email: BUSINESS.email,
    telephone: `+${whatsapp}`,
    priceRange: "₾₾",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Tbilisi",
      addressCountry: "GE",
      ...(hasStreet ? { streetAddress: BUSINESS.address } : {}),
    },
    areaServed: "Tbilisi",
    sameAs: [`https://instagram.com/${instagram}`, BUSINESS.facebookUrl],
  };

  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Nitchiani",
    url: SITE_URL,
    inLanguage: locale === "ka" ? "ka-GE" : "en-US",
    publisher: { "@id": `${SITE_URL}/#business` },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(business) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(website) }}
      />
    </>
  );
}
