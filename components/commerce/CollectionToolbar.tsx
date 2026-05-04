"use client";

import { X } from "lucide-react";
import { useTranslations } from "next-intl";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";
import { type ProductFilters, type SortKey, SORT_KEYS, isSortKey } from "@/lib/products/filter";
import { cn } from "@/lib/utils";

/**
 * Toolbar for /shop and /shop/[collection] — sort dropdown on the right, filter chips on the left.
 * State lives in the URL (`?sort=price-asc&color=Noir,Cream&onSale=1`) so filters are shareable
 * and survive a refresh. Native <select> for sort keeps it accessible without custom popover code.
 */
export function CollectionToolbar({
  totalCount,
  visibleCount,
  availableColors,
  filters,
  sort,
}: {
  totalCount: number;
  visibleCount: number;
  availableColors: string[];
  filters: ProductFilters;
  sort: SortKey;
}) {
  const t = useTranslations("shop");
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateParam = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === "") params.delete(key);
        else params.set(key, value);
      }
      const qs = params.toString();
      router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const toggleColor = useCallback(
    (color: string) => {
      const next = filters.colors.includes(color)
        ? filters.colors.filter((c) => c !== color)
        : [...filters.colors, color];
      updateParam({ color: next.length ? next.join(",") : null });
    },
    [filters.colors, updateParam],
  );

  const activeFilterCount =
    filters.colors.length +
    (filters.onSale ? 1 : 0) +
    (filters.availableOnly ? 1 : 0);

  const clearAll = useCallback(
    () => updateParam({ color: null, onSale: null, available: null }),
    [updateParam],
  );

  const sortOptions = useMemo(
    () => [
      { value: "featured", label: t("sortFeatured") },
      { value: "new", label: t("sortNew") },
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

        <label className="inline-flex items-center gap-2 text-xs">
          <span className="opacity-60">{t("sortLabel")}</span>
          <select
            value={sort}
            onChange={(e) => {
              const v = e.target.value;
              updateParam({ sort: isSortKey(v) && v !== "featured" ? v : null });
            }}
            className="cursor-pointer rounded-md border border-black/15 bg-transparent px-2 py-1.5 text-xs focus:border-[var(--color-brand-ink)] focus:outline-none"
          >
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {availableColors.map((color) => {
          const active = filters.colors.includes(color);
          return (
            <button
              key={color}
              type="button"
              onClick={() => toggleColor(color)}
              aria-pressed={active}
              className={cn(
                "cursor-pointer rounded-full border px-3 py-1.5 text-xs transition-colors",
                active
                  ? "border-[var(--color-brand-ink)] bg-[var(--color-brand-ink)] text-[var(--color-brand-cream)]"
                  : "border-black/15 hover:border-black/40",
              )}
            >
              {color}
            </button>
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
            className="ml-auto inline-flex cursor-pointer items-center gap-1 text-xs opacity-70 hover:opacity-100"
          >
            <X size={12} />
            {t("clearAll")} ({activeFilterCount})
          </button>
        ) : null}
      </div>
    </div>
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
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "cursor-pointer rounded-full border px-3 py-1.5 text-xs transition-colors",
        active
          ? "border-[var(--color-brand-maroon)] bg-[var(--color-brand-maroon)] text-[var(--color-brand-cream)]"
          : "border-black/15 hover:border-black/40",
      )}
    >
      {label}
    </button>
  );
}
