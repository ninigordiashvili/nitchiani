import { BUSINESS } from "@/lib/business";
import { SITE_URL } from "@/lib/seo";

/**
 * `/llms.txt` — a plain-text summary of the shop for AI assistants (ChatGPT, Claude,
 * Perplexity, Gemini). It names what is sold, how ordering works and where the facts live,
 * so an answer about the shop is built from this rather than guessed. Prices and stock are
 * deliberately left out: they change daily and belong to the product pages and sitemap.
 */
export const dynamic = "force-static";

export function GET() {
  const body = `# Nitchiani

> Nitchiani is a Tbilisi, Georgia brand (since 2021; online shop since 2026) selling synthetic braiding hair, clip-in braids and accessories, hair-care products, satin bonnets and durags. Prices are in Georgian lari (GEL). The site is in Georgian and English.

## Shop
- [All products](${SITE_URL}/en/shop): full catalogue
- [Hair extensions](${SITE_URL}/en/shop/hair-extensions): braiding hair, curls, clip-in braids and accessories
- [Hair care](${SITE_URL}/en/shop/hair-care): leave-in conditioners, hair wax
- [Satin bonnets](${SITE_URL}/en/shop/bonnets)
- [Durags](${SITE_URL}/en/shop/durags)
- [Product index](${SITE_URL}/llms-full.txt): every product name and link, by category
- [Sitemap](${SITE_URL}/sitemap.xml): every product page, with Georgian and English versions

## Ordering, delivery and returns
- Delivery across Georgia by courier: 1–3 working days in Tbilisi, 3–7 in the regions. The fee is shown at checkout.
- Free pickup in Tbilisi: ${BUSINESS.street.en}.
- Payment by bank card (Visa/Mastercard).
- 14-day right of withdrawal. Unused synthetic hair can be returned after opening; sealed hair-care products opened after delivery cannot.
- [About, delivery and FAQ](${SITE_URL}/en/about)
- [Terms](${SITE_URL}/en/terms)
- [Refund and returns policy](${SITE_URL}/en/refund)
- [Privacy](${SITE_URL}/en/privacy)

## Contact
- WhatsApp / phone: ${BUSINESS.phone}
- Email: ${BUSINESS.email}
- Instagram: https://instagram.com/Nitchiani.shop
- Facebook: ${BUSINESS.facebookUrl}

## Georgian version
- [მთავარი](${SITE_URL}/ka), [მაღაზია](${SITE_URL}/ka/shop), [ჩვენ შესახებ](${SITE_URL}/ka/about)
`;
  return new Response(body, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=3600",
    },
  });
}
