"use client";

import type { Product, ProductVariant } from "@/lib/shopify/types";
import { cn } from "@/lib/utils";

/**
 * Renders one row of pill-style chips per option group (Color / Size / Length / etc.).
 * - Selected chip is filled teal-black.
 * - Unavailable variants render strikethrough + disabled.
 * - Single-SKU products (no options or single value) render nothing — the picker self-hides.
 */
export function VariantPicker({
  product,
  selectedVariant,
  onSelect,
}: {
  product: Product;
  selectedVariant: ProductVariant;
  onSelect: (variant: ProductVariant) => void;
}) {
  if (
    product.options.length === 0 ||
    (product.options.length === 1 && product.options[0].values.length <= 1)
  ) {
    return null;
  }

  return (
    <div className="space-y-5">
      {product.options.map((option) => {
        const selectedValue = selectedVariant.selectedOptions.find(
          (o) => o.name === option.name,
        )?.value;

        return (
          <div key={option.name}>
            <p className="label-eyebrow mb-2">
              {option.name}
              {selectedValue ? (
                <span className="ml-2 normal-case tracking-normal text-[var(--color-brand-ink)]">
                  · {selectedValue}
                </span>
              ) : null}
            </p>
            <div className="flex flex-wrap gap-2">
              {option.values.map((value) => {
                const variantForValue = product.variants.find((v) =>
                  v.selectedOptions.some(
                    (o) => o.name === option.name && o.value === value,
                  ),
                );
                const isSelected = selectedValue === value;
                const isAvailable = variantForValue?.availableForSale ?? false;

                return (
                  <button
                    key={value}
                    type="button"
                    disabled={!isAvailable}
                    onClick={() => variantForValue && onSelect(variantForValue)}
                    aria-pressed={isSelected}
                    className={cn(
                      "min-w-[3.5rem] cursor-pointer rounded-md border px-4 py-2 text-sm transition-colors",
                      isSelected
                        ? "border-[var(--color-brand-ink)] bg-[var(--color-brand-ink)] text-[var(--color-brand-cream)]"
                        : "border-black/15 hover:border-black/40",
                      !isAvailable &&
                        "cursor-not-allowed border-black/10 text-[var(--color-brand-silver-2)] line-through opacity-60 hover:border-black/10",
                    )}
                  >
                    {value}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
