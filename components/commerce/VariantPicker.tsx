"use client";

import { useTranslations } from "next-intl";
import type { Product, ProductVariant } from "@/lib/shopify/types";
import { cn } from "@/lib/utils";
import { SizeGuideButton } from "./SizeGuideButton";

/** Option names that should surface the (hair) Size guide link next to the label row. */
const SIZE_GUIDE_OPTION_RE = /^(size|length|ზომა|სიგრძე)$/i;


/**
 * Renders one row of pill-style chips per option group (Color / Size / Length / etc.).
 * - Selected chip is filled teal-black.
 * - Sold-out variants render strikethrough + disabled; ones the merchant switched off render
 *   selectable with a "coming soon" caption (the add button then says so too).
 * - Single-SKU products (no options or single value) render nothing — the picker self-hides.
 * - Size/Length option labels get a "Size guide" link on the right that opens a measurement modal.
 */
export function VariantPicker({
  product,
  selectedVariant,
  onSelect,
  showSizeGuide = true,
}: {
  product: Product;
  selectedVariant: ProductVariant;
  onSelect: (variant: ProductVariant) => void;
  showSizeGuide?: boolean;
}) {
  const t = useTranslations("product");
  if (
    product.options.length === 0 ||
    (product.options.length === 1 && product.options[0].values.length <= 1)
  ) {
    return null;
  }

  // Only the FIRST size/length option gets the guide link — avoids two buttons when a
  // product has more than one dimensional axis.
  const sizeGuideOption = showSizeGuide
    ? product.options.find((o) => SIZE_GUIDE_OPTION_RE.test(o.name))
    : null;

  return (
    <div className="space-y-5">
      {product.options.map((option) => {
        const selectedValue = selectedVariant.selectedOptions.find(
          (o) => o.name === option.name,
        )?.value;

        return (
          <div key={option.name}>
            <div className="mb-2 flex items-center justify-between gap-3">
              <p className="label-eyebrow">
                {option.name}
                {selectedValue ? (
                  <span className="ml-2 normal-case tracking-normal text-[var(--color-brand-ink)]">
                    · {selectedValue}
                  </span>
                ) : null}
              </p>
              {option === sizeGuideOption ? <SizeGuideButton /> : null}
            </div>
            <div className="flex flex-wrap gap-2">
              {option.values.map((value) => {
                const variantForValue = product.variants.find((v) =>
                  v.selectedOptions.some(
                    (o) => o.name === option.name && o.value === value,
                  ),
                );
                const isSelected = selectedValue === value;
                const isAvailable = variantForValue?.availableForSale ?? false;
                const comingSoon = variantForValue?.comingSoon === true;

                return (
                  <button
                    key={value}
                    type="button"
                    disabled={!isAvailable && !comingSoon}
                    onClick={() => variantForValue && onSelect(variantForValue)}
                    aria-pressed={isSelected}
                    className={cn(
                      "min-w-[3.5rem] cursor-pointer rounded-md border px-4 py-2 text-sm transition-colors",
                      isSelected
                        ? "border-[var(--text-primary)] bg-[var(--text-primary)] text-[var(--surface)]"
                        : "border-black/15 hover:border-black/40",
                      comingSoon && "flex flex-col items-center leading-tight opacity-70",
                      !isAvailable &&
                        !comingSoon &&
                        "cursor-not-allowed border-black/10 text-[var(--color-brand-silver-2)] line-through opacity-60 hover:border-black/10",
                    )}
                  >
                    {value}
                    {comingSoon ? (
                      <span className="mt-0.5 text-[10px] font-medium uppercase tracking-wide opacity-80">
                        {t("comingSoon")}
                      </span>
                    ) : null}
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
