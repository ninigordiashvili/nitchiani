import type { Locale } from "@/lib/i18n/config";
import { NO_REVIEWS } from "@/lib/reviews";
import type { Product } from "@/lib/shopify/types";

/**
 * Schema.org `Product` JSON-LD for rich Google search results (star rating, price,
 * stock badge in the SERP snippet). Emitted as a non-rendering `<script>` — server
 * component so no client cost.
 *
 * The rating comes from EchoDesk with the product. Individual `Review` entries are not
 * emitted: Google requires each to carry an author and a body, and the only ones we have are
 * fetched per product on the page itself — the aggregate is what earns the stars in the
 * snippet, and it is the half we can state truthfully from here.
 */
export function ProductJsonLd({
  product,
  locale,
}: {
  product: Product;
  locale: Locale;
}) {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
    "http://localhost:3000";

  const url = `${baseUrl}/${locale}/products/${product.handle}`;
  // Structured data must describe the product actually on sale: its own rating, from the
  // backend, or none at all.
  const summary = product.reviewSummary ?? NO_REVIEWS;

  const inStock = product.variants.some((v) => v.availableForSale);
  const variant = product.variants[0];
  const price = variant?.price.amount ?? product.priceRange.min.amount;
  const currency = variant?.price.currencyCode ?? "GEL";

  // Schema.org Product. Optional fields are spread in conditionally so the JSON stays
  // valid (Google rejects entries with empty `aggregateRating` or `review` arrays).
  const data: Record<string, unknown> = {
    "@context": "https://schema.org/",
    "@type": "Product",
    name: product.title,
    description: product.description,
    image: product.images.map((img) => img.url),
    // The merchant's code when there is one. This used to publish the slug as the SKU,
    // which told Google the wax was `lor-wax-08` rather than `LOR-WAX-08`; a single-variant
    // product's own code is the better answer, and the handle remains the fallback for a
    // catalogue that has none.
    sku: product.sku ?? product.variants[0]?.sku ?? product.handle,
    brand: {
      "@type": "Brand",
      name: product.vendor || "Nitchiani",
    },
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: currency,
      price,
      availability: inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
    },
  };

  if (summary.count > 0) {
    data.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: summary.average,
      reviewCount: summary.count,
      bestRating: 5,
      worstRating: 1,
    };
  }

  return (
    <script
      type="application/ld+json"
      // Stringified once on the server; no client hydration of this content.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
