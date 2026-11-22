"use client";

import { ChevronDown, SlidersHorizontal, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useSetUrlQuery } from "@/lib/ui/use-url-query";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  type AttributeFacet,
  type ProductFilters,
  type SortKey,
  isSortKey,
  serializeAttributeParam,
} from "@/lib/products/filter";
import { Select } from "@/components/ui/Select";
import { cn } from "@/lib/utils";

/**
 * Toolbar for /shop and /shop/[collection] — sort dropdown on the right, filter chips on the left.
 * State lives in the URL (`?sort=price-asc&color=Noir,Cream&onSale=1`) so filters are shareable
 * and survive a refresh. Sort uses the branded <Select> listbox — a native <select> draws its
 * option list through the OS, which ignores the brand surface and typography entirely.
 */
export function CollectionToolbar({
  totalCount,
  visibleCount,
  colorFacet,
  priceTiers,
  showOnSale,
  showAvailable,
  attributeFacets,
  filters,
  sort,
}: {
  totalCount: number;
  visibleCount: number;
  /**
   * Every colour on offer, from the product attribute and the variant options alike, or null
   * when there aren't two to choose between. Its own row rather than a member of
   * `attributeFacets`: it filters through `?color=`, not `?attr=`.
   */
  colorFacet: AttributeFacet | null;
  /** Price chips that actually split this set of products — see `priceTiers`. */
  priceTiers: number[];
  /** Only shown when something here is discounted; otherwise the chip leads to no results. */
  showOnSale: boolean;
  /** Only shown when something here is sold out; otherwise it filters nothing. */
  showAvailable: boolean;
  /** Attribute groups worth filtering by, derived from the products on screen. */
  attributeFacets: AttributeFacet[];
  filters: ProductFilters;
  sort: SortKey;
}) {
  const t = useTranslations("shop");
  // The whole filter panel is folded away until asked for, on every screen size: with a dozen
  // rows of chips it pushed every product below the fold. The button carries a count, so
  // filters that are on are never hidden without a sign.
  const [openOnMobile, setOpenOnMobile] = useState(false);

  const activeFilterCount =
    Object.values(filters.attributes).reduce((n, v) => n + v.length, 0) +
    filters.colors.length +
    (filters.onSale ? 1 : 0) +
    (filters.availableOnly ? 1 : 0) +
    (filters.maxPrice !== null ? 1 : 0);
  // Updates the address bar in place — no server round trip, and the page can stay cached.
  const updateParam = useSetUrlQuery();

  const toggleColor = useCallback(
    (color: string) => {
      const next = filters.colors.includes(color)
        ? filters.colors.filter((c) => c !== color)
        : [...filters.colors, color];
      updateParam({ color: next.length ? next.join(",") : null });
    },
    [filters.colors, updateParam],
  );

  const toggleAttribute = useCallback(
    (key: string, value: string) => {
      const current = filters.attributes[key] ?? [];
      const nextValues = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      const next = { ...filters.attributes, [key]: nextValues };
      updateParam({ attr: serializeAttributeParam(next) });
    },
    [filters.attributes, updateParam],
  );


  const clearAll = useCallback(
    () =>
      updateParam({ color: null, onSale: null, available: null, maxPrice: null, attr: null }),
    [updateParam],
  );

  const hairFacets = attributeFacets.filter((f) => f.hair !== false);
  const otherFacets = attributeFacets.filter((f) => f.hair === false);
  const renderFacet = (facet: AttributeFacet) => (
    <FacetRow
      key={facet.key}
      name={facet.name}
      startOpen={(filters.attributes[facet.key] ?? []).length > 0}
    >
      {facet.values.map((value) => {
        const active = (filters.attributes[facet.key] ?? []).includes(value);
        return (
          <Chip key={value} active={active} onClick={() => toggleAttribute(facet.key, value)}>
            {value}
          </Chip>
        );
      })}
    </FacetRow>
  );

  const sortOptions: { value: SortKey; label: string }[] = useMemo(
    () => [
      { value: "featured", label: t("sortFeatured") },
      { value: "price-asc", label: t("sortPriceAsc") },
      { value: "price-desc", label: t("sortPriceDesc") },
    ],
    [t],
  );

  return (
    <div className="mb-6 flex flex-col gap-3 border-b border-black/10 pb-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs opacity-60">
          {visibleCount === totalCount
            ? t("countAll", { count: totalCount })
            : t("countFiltered", { visible: visibleCount, total: totalCount })}
        </p>

        {/* Opens and folds the whole panel. */}
        <button
          type="button"
          onClick={() => setOpenOnMobile((v) => !v)}
          aria-expanded={openOnMobile}
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-black/25 bg-white/80 px-3.5 py-1.5 text-[13px] font-medium text-[var(--color-brand-ink)]"
        >
          <SlidersHorizontal size={14} aria-hidden />
          {t("filters")}
          {activeFilterCount > 0 ? (
            <span
              className="rounded-full px-1.5 text-[11px] tabular-nums"
              style={{ background: "var(--color-brand-maroon)", color: "var(--color-brand-cream)" }}
            >
              {activeFilterCount}
            </span>
          ) : null}
          <ChevronDown
            size={14}
            aria-hidden
            className={cn("transition-transform", openOnMobile && "rotate-180")}
          />
        </button>

        <div className="inline-flex items-center gap-2 text-xs">
          <span className="opacity-60">{t("sortLabel")}</span>
          <Select
            value={sort}
            options={sortOptions}
            onChange={(v) =>
              updateParam({ sort: isSortKey(v) && v !== "featured" ? v : null })
            }
            label={t("sortLabel")}
          />
        </div>
      </div>

      <div className={cn("flex-col gap-4", openOnMobile ? "flex" : "hidden")}>
      {/* One row per backend attribute (hair type, length, …), each labelled with the
          attribute's own name so the chips read as a group rather than a loose pile. Renders
          nothing until the catalog actually defines a filterable attribute with more than one
          value across the products on screen. */}
      {hairFacets.map(renderFacet)}

      {/* Last of the labelled rows, and labelled like them. Colour sat loose in the row of
          standing toggles below, so it read as a sibling of "up to ₾25" rather than as the
          answer to "what colours are there?". */}
      {colorFacet ? (
        <FacetRow name={colorFacet.name} startOpen={filters.colors.length > 0}>
          {colorFacet.values.map((color) => (
            <Chip
              key={color}
              active={filters.colors.includes(color)}
              onClick={() => toggleColor(color)}
            >
              {color}
            </Chip>
          ))}
        </FacetRow>
      ) : null}

      {otherFacets.map(renderFacet)}

      <div className="flex flex-wrap items-center gap-2">
        {priceTiers.map((tier) => {
          const active = filters.maxPrice === tier;
          return (
            <Toggle
              key={tier}
              active={active}
              onClick={() =>
                updateParam({ maxPrice: active ? null : String(tier) })
              }
              label={t("filterUnderPrice", { amount: `₾${tier}` })}
            />
          );
        })}
        {showOnSale || filters.onSale ? (
          <Toggle
            active={filters.onSale}
            onClick={() => updateParam({ onSale: filters.onSale ? null : "1" })}
            label={t("filterOnSale")}
          />
        ) : null}
        {showAvailable || filters.availableOnly ? (
          <Toggle
            active={filters.availableOnly}
            onClick={() =>
              updateParam({ available: filters.availableOnly ? null : "1" })
            }
            label={t("filterAvailable")}
          />
        ) : null}

        {activeFilterCount > 0 ? (
          <button
            type="button"
            onClick={() => {
              clearAll();
              setOpenOnMobile(false);
            }}
            // A real button, not faint text: once filters are on, this is the way back to
            // everything, and it has to be findable at a glance.
            className="ml-auto inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-[var(--color-brand-maroon)] px-3.5 py-1.5 text-[13px] font-medium text-[var(--color-brand-maroon)] transition-colors hover:bg-[var(--color-brand-maroon)] hover:text-[var(--color-brand-cream)]"
          >
            <X size={14} strokeWidth={2.25} />
            {t("clearAll")} ({activeFilterCount})
          </button>
        ) : null}
      </div>
      </div>
    </div>
  );
}

/**
 * One labelled group of chips.
 *
 * The label sits in a fixed column, so every group's chips start at the same line and the
 * rows read as a table rather than a ragged pile. Plain weight and no letter-spacing: the
 * tracked small caps used before were barely legible in Georgian.
 */
function FacetRow({
  name,
  startOpen = false,
  children,
}: {
  name: string;
  /** Open from the start when a chip in the row is on, so a selection is never tucked away. */
  startOpen?: boolean;
  children: React.ReactNode;
}) {
  const t = useTranslations("shop");
  const [expanded, setExpanded] = useState(startOpen);
  const [overflows, setOverflows] = useState(false);
  const chipsRef = useRef<HTMLDivElement>(null);

  // A row that fits on one line needs no button; only the long ones (colour, texture) do.
  // Measured rather than counted, since chip widths and screen widths both vary.
  useEffect(() => {
    const el = chipsRef.current;
    if (!el) return;
    const measure = () => {
      const first = el.firstElementChild as HTMLElement | null;
      if (!first) return setOverflows(false);
      setOverflows(el.scrollHeight > first.offsetHeight + 4);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [children]);

  const folded = overflows && !expanded;

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:gap-3">
      <span className="text-[13px] font-semibold text-[var(--color-brand-ink)] sm:w-28 sm:flex-shrink-0 sm:pt-1.5">
        {name}
      </span>
      <div className="flex min-w-0 flex-1 items-start gap-3">
        <div
          ref={chipsRef}
          // One line while folded: the clip height is a chip's own height.
          className={cn("flex min-w-0 flex-1 flex-wrap gap-2", folded && "max-h-[2.25rem] overflow-hidden")}
        >
          {children}
        </div>
        {overflows ? (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            aria-expanded={expanded}
            className="inline-flex flex-shrink-0 cursor-pointer items-center gap-1 whitespace-nowrap py-1.5 text-[13px] font-medium text-[var(--color-brand-maroon)] underline-offset-4 hover:underline"
          >
            {expanded ? t("facetShowLess") : t("facetShowAll")}
            <ChevronDown size={14} aria-hidden className={cn("transition-transform", expanded && "rotate-180")} />
          </button>
        ) : null}
      </div>
    </div>
  );
}

/**
 * One filter chip. White on the cream page with a firm border, so it reads as something to
 * press; the selected state fills in, so it's clear at a glance what is on.
 */
function Chip({
  active,
  onClick,
  tone = "ink",
  children,
}: {
  active: boolean;
  onClick: () => void;
  /** Ink for attribute filters, maroon for the shop-wide toggles (price, sale, stock). */
  tone?: "ink" | "maroon";
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "inline-flex cursor-pointer items-center rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition-colors",
        active
          ? tone === "maroon"
            ? "border-[var(--color-brand-maroon)] bg-[var(--color-brand-maroon)] text-[var(--color-brand-cream)]"
            : "border-[var(--text-primary)] bg-[var(--text-primary)] text-[var(--surface)]"
          : "border-black/25 bg-white/80 text-[var(--color-brand-ink)] hover:border-black/60 hover:bg-white",
      )}
    >
      {children}
    </button>
  );
}

function Toggle({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <Chip active={active} onClick={onClick} tone="maroon">
      {label}
    </Chip>
  );
}
