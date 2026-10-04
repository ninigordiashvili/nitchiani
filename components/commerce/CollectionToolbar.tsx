"use client";

import { X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useSetUrlQuery } from "@/lib/ui/use-url-query";
import { useCallback, useMemo } from "react";
import {
  type AttributeFacet,
  type ProductFilters,
  type SortKey,
  PRICE_TIERS,
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
  availableColors,
  attributeFacets,
  filters,
  sort,
}: {
  totalCount: number;
  visibleCount: number;
  availableColors: string[];
  /** Attribute groups worth filtering by, derived from the products on screen. */
  attributeFacets: AttributeFacet[];
  filters: ProductFilters;
  sort: SortKey;
}) {
  const t = useTranslations("shop");
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

  const activeFilterCount =
    Object.values(filters.attributes).reduce((n, v) => n + v.length, 0) +
    filters.colors.length +
    (filters.onSale ? 1 : 0) +
    (filters.availableOnly ? 1 : 0) +
    (filters.maxPrice !== null ? 1 : 0);

  const clearAll = useCallback(
    () =>
      updateParam({ color: null, onSale: null, available: null, maxPrice: null, attr: null }),
    [updateParam],
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
    <div className="mb-6 flex flex-col gap-4 border-b border-black/10 pb-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs opacity-60">
          {visibleCount === totalCount
            ? t("countAll", { count: totalCount })
            : t("countFiltered", { visible: visibleCount, total: totalCount })}
        </p>

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

      {/* One row per backend attribute (hair type, length, …), each labelled with the
          attribute's own name so the chips read as a group rather than a loose pile. Renders
          nothing until the catalog actually defines a filterable attribute with more than one
          value across the products on screen. */}
      {attributeFacets.map((facet) => (
        <div key={facet.key} className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
          {/* A fixed column, so every group's chips start at the same line and the rows read
              as a table rather than a ragged pile. Plain weight and no letter-spacing: the
              tracked small caps used before were barely legible in Georgian. */}
          <span className="text-[13px] font-semibold text-[var(--color-brand-ink)] sm:w-28 sm:flex-shrink-0">
            {facet.name}
          </span>
          <div className="flex flex-wrap gap-2">
            {facet.values.map((value) => {
              const active = (filters.attributes[facet.key] ?? []).includes(value);
              return (
                <Chip key={value} active={active} onClick={() => toggleAttribute(facet.key, value)}>
                  {value}
                </Chip>
              );
            })}
          </div>
        </div>
      ))}

      <div className="flex flex-wrap items-center gap-2">
        {availableColors.map((color) => {
          const active = filters.colors.includes(color);
          return (
            <Chip key={color} active={active} onClick={() => toggleColor(color)}>
              {color}
            </Chip>
          );
        })}
        {PRICE_TIERS.map((tier) => {
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
        <Toggle
          active={filters.onSale}
          onClick={() => updateParam({ onSale: filters.onSale ? null : "1" })}
          label={t("filterOnSale")}
        />
        <Toggle
          active={filters.availableOnly}
          onClick={() =>
            updateParam({ available: filters.availableOnly ? null : "1" })
          }
          label={t("filterAvailable")}
        />

        {activeFilterCount > 0 ? (
          <button
            type="button"
            onClick={clearAll}
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
