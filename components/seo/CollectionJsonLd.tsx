import { SITE_URL } from "@/lib/seo";
import type { Locale } from "@/lib/i18n/config";
import type { Product } from "@/lib/shopify/types";

/**
 * `CollectionPage` + `ItemList` for a listing page: tells search engines and AI assistants
 * which products a category contains, in order. Only names and URLs — prices and stock live
 * on the product pages' own markup, where they are kept current.
 */
export function collectionJsonLd({
  locale,
  path,
  name,
  description,
  products,
}: {
  locale: Locale;
  path: string;
  name: string;
  description?: string;
  products: Pick<Product, "handle" | "title">[];
}) {
  const url = `${SITE_URL}/${locale}${path}`;
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${url}#collection`,
    url,
    name,
    ...(description ? { description } : {}),
    inLanguage: locale === "ka" ? "ka-GE" : "en-US",
    isPartOf: { "@id": `${SITE_URL}/#business` },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: products.length,
      itemListElement: products.map((p, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `${SITE_URL}/${locale}/products/${p.handle}`,
        name: p.title,
      })),
    },
  };
}

export function CollectionJsonLd(props: Parameters<typeof collectionJsonLd>[0]) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd(props)) }}
    />
  );
}
