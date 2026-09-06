"use client";

import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { Link } from "@/lib/i18n/routing";
import {
  applyFilters,
  applySort,
  DEFAULT_SORT,
  EMPTY_FILTERS,
  extractAttributeFacets,
  parseAttributeParam,
  extractColors,
  isSortKey,
  type ProductFilters,
  type SortKey,
} from "@/lib/products/filter";
import type { Product } from "@/lib/shopify/types";
import { ProductGrid } from "./ProductGrid";
import { CollectionToolbar } from "./CollectionToolbar";

/**
 * Wrapper that owns the filter + sort state (read from URL search params) and renders the
 * toolbar + filtered/sorted product grid. Used by both /shop and /shop/[collection].
 */
export function FilteredCollection({ products }: { products: Product[] }) {
  const t = useTranslations("shop");
  const searchParams = useSearchParams();

  const sort: SortKey = useMemo(() => {
    const raw = searchParams.get("sort") ?? DEFAULT_SORT;
    return isSortKey(raw) ? raw : DEFAULT_SORT;
  }, [searchParams]);

  const filters: ProductFilters = useMemo(() => {
    const colorParam = searchParams.get("color");
    const maxPriceRaw = searchParams.get("maxPrice");
    const maxPriceNum = maxPriceRaw ? Number.parseInt(maxPriceRaw, 10) : NaN;
    return {
      colors: colorParam ? colorParam.split(",").filter(Boolean) : EMPTY_FILTERS.colors,
      onSale: searchParams.get("onSale") === "1",
      availableOnly: searchParams.get("available") === "1",
      maxPrice: Number.isFinite(maxPriceNum) && maxPriceNum > 0 ? maxPriceNum : null,
      attributes: parseAttributeParam(searchParams.get("attr")),
    };
  }, [searchParams]);

  const availableColors = useMemo(() => extractColors(products), [products]);
  // Facets come from the products themselves, so an attribute added in the CMS shows up here
  // with no code change — and one that isn't worth filtering by never appears.
  const attributeFacets = useMemo(() => extractAttributeFacets(products), [products]);

  const visible = useMemo(() => {
    const filtered = applyFilters(products, filters);
    return applySort(filtered, sort);
  }, [products, filters, sort]);

  return (
    <>
      <CollectionToolbar
        totalCount={products.length}
        visibleCount={visible.length}
        availableColors={availableColors}
        attributeFacets={attributeFacets}
        filters={filters}
        sort={sort}
      />
      {visible.length > 0 ? (
        <ProductGrid products={visible} priorityFirst={4} />
      ) : (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <p className="font-display text-2xl">{t("noResultsTitle")}</p>
          <p className="max-w-sm text-sm opacity-70">{t("noResultsDesc")}</p>
          <Link href="/shop" className="btn-ghost mt-2">
            {t("browseAll")}
          </Link>
        </div>
      )}
    </>
  );
}


