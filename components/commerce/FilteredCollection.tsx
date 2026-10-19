"use client";

import { useTranslations } from "next-intl";
import { useSetUrlQuery, useUrlQuery } from "@/lib/ui/use-url-query";
import { useMemo } from "react";
import { Link } from "@/lib/i18n/routing";
import { cn } from "@/lib/utils";
import {
  DEFAULT_SORT,
  EMPTY_FILTERS,
  anyOnSale,
  anySoldOut,
  applyFilters,
  applySort,
  COLOR_FACET_KEY,
  extractAttributeFacets,
  extractColorFacet,
  isSortKey,
  parseAttributeParam,
  priceTiers,
  type ProductFilters,
  type SortKey,
} from "@/lib/products/filter";
import type { CategoryDef } from "@/lib/categories";
import { subcategoryFor } from "@/lib/echodesk/categories";
import type { Product } from "@/lib/shopify/types";
import { ProductGrid } from "./ProductGrid";
import { CollectionToolbar } from "./CollectionToolbar";

/**
 * Wrapper that owns the filter + sort state (read from URL search params) and renders the
 * toolbar + filtered/sorted product grid. Used by both /shop and /shop/[collection].
 */
export function FilteredCollection({
  products,
  subcategories = null,
}: {
  products: Product[];
  /** The category's own split, when it has one — see `subcategories` in lib/categories.ts. */
  subcategories?: CategoryDef["subcategories"] | null;
}) {
  const t = useTranslations("shop");
  const tCategories = useTranslations("categories");
  const searchParams = useUrlQuery();
  const updateParam = useSetUrlQuery();
  const query = searchParams.toString();

  const sort: SortKey = useMemo(() => {
    const raw = searchParams.get("sort") ?? DEFAULT_SORT;
    return isSortKey(raw) ? raw : DEFAULT_SORT;
  }, [query]);

  const filters: ProductFilters = useMemo(() => {
    const colorParam = searchParams.get("color");
    const maxPriceRaw = searchParams.get("maxPrice");
    const maxPriceNum = maxPriceRaw ? Number.parseInt(maxPriceRaw, 10) : NaN;
    // Colour used to be offered twice, and the attribute copy wrote `?attr=color:…`. Those
    // links are shareable by design, so a bookmark from then is folded into `?color=` rather
    // than left pointing at a facet that no longer exists.
    const { [COLOR_FACET_KEY]: legacyColors = [], ...attributes } = parseAttributeParam(
      searchParams.get("attr"),
    );
    const colors = colorParam ? colorParam.split(",").filter(Boolean) : EMPTY_FILTERS.colors;
    return {
      colors: [...new Set([...colors, ...legacyColors])],
      onSale: searchParams.get("onSale") === "1",
      availableOnly: searchParams.get("available") === "1",
      maxPrice: Number.isFinite(maxPriceNum) && maxPriceNum > 0 ? maxPriceNum : null,
      attributes,
    };
  }, [query]);

  // Which half is on screen. Everything below reads `scoped`, not `products`, so the chips,
  // the facet rows and the "N products" count all describe the same set — picking
  // accessories drops the length and texture rows, because no accessory carries them.
  const type = subcategories ? searchParams.get("type") : null;
  const scoped = useMemo(
    () =>
      type && subcategories
        ? products.filter((p) => subcategoryFor(p.handle, subcategories.defaultKey) === type)
        : products,
    [products, type, subcategories],
  );

  const colorFacet = useMemo(() => extractColorFacet(scoped), [scoped]);
  // Which of the standing toggles can do anything for this set of products.
  const chips = useMemo(
    () => ({
      tiers: priceTiers(scoped),
      onSale: anyOnSale(scoped),
      soldOut: anySoldOut(scoped),
    }),
    [scoped],
  );
  // Facets come from the products themselves, so an attribute added in the CMS shows up here
  // with no code change — and one that isn't worth filtering by never appears.
  const attributeFacets = useMemo(() => extractAttributeFacets(scoped), [scoped]);

  const visible = useMemo(() => {
    const filtered = applyFilters(scoped, filters);
    return applySort(filtered, sort);
  }, [scoped, filters, sort]);

  return (
    <>
      <CollectionToolbar
        totalCount={scoped.length}
        visibleCount={visible.length}
        colorFacet={colorFacet}
        priceTiers={chips.tiers}
        showOnSale={chips.onSale}
        showAvailable={chips.soldOut}
        attributeFacets={attributeFacets}
        filters={filters}
        sort={sort}
      />

      {/* The category's own split, centred directly above the first row of products.
          It sat above the filter rows and in their pill style, which made the coarsest
          choice on the page look like the smallest — one more facet among six. Below the
          toolbar's rule and on its own line it reads as what it is: which half of the
          category you are looking at. No uppercase or letter-spacing here, deliberately —
          see the note on the facet labels; tracked small caps are hard to read in Georgian,
          and this is the text that most needs reading. */}
      {subcategories ? (
        <nav
          aria-label={t("filters")}
          className="mb-7 flex flex-wrap items-center justify-center gap-2"
        >
          {[
            { key: null as string | null, label: t("allTypes") },
            ...subcategories.options.map((o) => ({ key: o.key, label: tCategories(o.labelKey) })),
          ].map((option) => {
            const active = type === option.key;
            return (
              <button
                key={option.key ?? "all"}
                type="button"
                onClick={() => updateParam({ type: option.key })}
                aria-pressed={active}
                className={cn(
                  "cursor-pointer rounded-full border px-5 py-2.5 text-sm font-semibold transition-colors",
                  active
                    ? "border-[var(--color-brand-maroon)] bg-[var(--color-brand-maroon)] text-[var(--color-brand-cream)]"
                    : "border-black/20 bg-white/80 text-[var(--color-brand-ink)] hover:border-[var(--color-brand-maroon)] hover:text-[var(--color-brand-maroon)]",
                )}
              >
                {option.label}
              </button>
            );
          })}
        </nav>
      ) : null}

      {visible.length > 0 ? (
        <ProductGrid products={visible} priorityFirst={2} />
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


