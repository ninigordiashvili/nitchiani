import { ChevronRight } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/lib/i18n/routing";
import { CATEGORIES } from "@/lib/categories";
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
  const [t, tCategories] = await Promise.all([
    getTranslations("nav"),
    getTranslations("categories"),
  ]);
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
    "http://localhost:3000";

  // The middle crumb only exists when the product has a category. It used to be rendered
  // unconditionally from an always-empty field, which left a nameless link between two
  // chevrons — invisible to a shopper, and a `BreadcrumbList` Google rejects for the missing
  // `name`.
  const category = CATEGORIES.find((c) => c.handle === product.productTypeHandle);

  const items = [
    { name: t("shop"), href: "/shop", url: `${baseUrl}/${locale}/shop` },
    ...(category
      ? [
          {
            name: tCategories(category.labelKey),
            href: `/shop/${category.handle}`,
            url: `${baseUrl}/${locale}/shop/${category.handle}`,
          },
        ]
      : []),
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
        aria-label={t("breadcrumb")}
        className="mb-3 flex items-center gap-1.5 text-[11px] opacity-70"
      >
        {items.map((it, i) => (
          <span key={i} className="flex min-w-0 items-center gap-1.5">
            {it.href ? (
              <Link href={it.href} className="group hover:opacity-100">
                <span className="underline-motion">{it.name}</span>
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
