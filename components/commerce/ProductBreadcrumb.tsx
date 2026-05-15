import { ChevronRight } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/lib/i18n/routing";
import type { Locale } from "@/lib/i18n/config";
import type { Product } from "@/lib/shopify/types";

/**
 * Three-level breadcrumb shown above the PDP title: Shop / Category / Product.
 * Helps users who arrived via search / direct link orient themselves in the catalog,
 * and emits Schema.org `BreadcrumbList` JSON-LD so Google can replace the URL crumb in
 * search results with the human-readable path.
 *
 * Server component — translations resolve at render, no client cost.
 */
export async function ProductBreadcrumb({
  product,
  locale,
}: {
  product: Product;
  locale: Locale;
}) {
  const t = await getTranslations("nav");
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
    "http://localhost:3000";

  const items = [
    { name: t("shop"), href: "/shop", url: `${baseUrl}/${locale}/shop` },
    {
      name: product.productType,
      href: `/shop/${product.productTypeHandle}`,
      url: `${baseUrl}/${locale}/shop/${product.productTypeHandle}`,
    },
    {
      name: product.title,
      href: null,
      url: `${baseUrl}/${locale}/products/${product.handle}`,
    },
  ];

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: it.url,
    })),
  };

  return (
    <>
      <nav
        aria-label="Breadcrumb"
        className="mb-3 flex items-center gap-1.5 text-[11px] opacity-70"
      >
        {items.map((it, i) => (
          <span key={i} className="flex min-w-0 items-center gap-1.5">
            {it.href ? (
              <Link href={it.href} className="hover:opacity-100 hover:underline">
                {it.name}
              </Link>
            ) : (
              <span className="truncate" aria-current="page">
                {it.name}
              </span>
            )}
            {i < items.length - 1 ? (
              <ChevronRight size={11} className="flex-shrink-0 opacity-50" />
            ) : null}
          </span>
        ))}
      </nav>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
    </>
  );
}
