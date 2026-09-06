import type { Locale } from "@/lib/i18n/config";
import { getReviewSummary, getReviewsForProduct } from "@/lib/reviews";
import type { Product } from "@/lib/shopify/types";

/**
 * Schema.org `Product` JSON-LD for rich Google search results (star rating, price,
 * stock badge in the SERP snippet). Emitted as a non-rendering `<script>` — server
 * component so no client cost.
 *
 * Reviews are pulled from the same local registry the PDP renders. When we move to a
 * real review provider (Judge.me / Yotpo / Shopify Product Reviews), the `getReviewsForProduct`
 * call swaps and this component keeps working.
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
  // Structured data must describe the product actually on sale. For a live product that
  // means its own rating and no reviews unless the backend has some — publishing the sample
  // map's invented testimonials as schema.org Review would be misrepresentation to search.
  const summary = product.reviewSummary ?? getReviewSummary(product.handle);
  const reviews = product.reviewSummary ? [] : getReviewsForProduct(product.handle, locale);

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
    sku: product.handle,
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
    data.review = reviews.map((r) => ({
      "@type": "Review",
      reviewRating: {
        "@type": "Rating",
        ratingValue: r.rating,
        bestRating: 5,
      },
      author: { "@type": "Person", name: r.author },
      datePublished: r.date,
      reviewBody: r.body,
    }));
  }

  return (
    <script
      type="application/ld+json"
      // Stringified once on the server; no client hydration of this content.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
