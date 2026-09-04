"use client";

import { Minus, Plus, Truck } from "lucide-react";
import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import type { Product } from "@/lib/shopify/types";
import { clampToStock, isAtStockLimit } from "@/lib/cart/stock";
import { AddToBagButton } from "./AddToBagButton";
import { PriceDisplay } from "./PriceDisplay";
import { StickyAddToBag } from "./StickyAddToBag";
import { VariantPicker } from "./VariantPicker";

/**
 * Owns the selected variant + quantity on a PDP. Composes price + picker + qty stepper +
 * add-to-bag so they all stay in sync when the user picks a different size/color/length.
 *
 * Also renders the mobile sticky CTA, which mirrors the same selected variant and quantity
 * and only shows when the inline button has scrolled out of view.
 *
 * Picker self-hides for single-SKU products (the price + qty + Add to bag still render).
 */
export function ProductPurchase({
  product,
  showSizeGuide = true,
  onAdded,
}: {
  product: Product;
  showSizeGuide?: boolean;
  /** Passed straight to AddToBagButton — the quick-view sheet closes on it. */
  onAdded?: () => void;
}) {
  const t = useTranslations("product");
  const tNav = useTranslations("nav");
  const [selected, setSelected] = useState(
    product.variants.find((v) => v.availableForSale) ?? product.variants[0],
  );
  const [quantity, setQuantity] = useState(1);

  const inlineCtaRef = useRef<HTMLDivElement>(null);

  return (
    <div className="space-y-5">
      <PriceDisplay
        price={selected.price}
        compareAt={selected.compareAtPrice}
        size="lg"
      />

      <VariantPicker
        product={product}
        selectedVariant={selected}
        onSelect={setSelected}
        showSizeGuide={showSizeGuide}
      />

      <div ref={inlineCtaRef} className="flex items-stretch gap-3">
        <div className="flex items-center rounded-md border border-black/15">
          <button
            type="button"
            aria-label={tNav("decreaseQuantity")}
            disabled={quantity <= 1}
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="flex h-full cursor-pointer items-center justify-center px-3 disabled:cursor-not-allowed disabled:opacity-30"
          >
            <Minus size={14} />
          </button>
          <span className="min-w-[2rem] text-center text-sm tabular-nums">
            {quantity}
          </span>
          <button
            type="button"
            aria-label={tNav("increaseQuantity")}
            onClick={() => setQuantity((q) => clampToStock(q + 1, selected?.quantityAvailable))}
            disabled={isAtStockLimit(quantity, selected?.quantityAvailable)}
            className="flex h-full cursor-pointer items-center justify-center px-3 disabled:cursor-not-allowed disabled:opacity-30"
          >
            <Plus size={14} />
          </button>
        </div>
        <div className="flex-1">
          <AddToBagButton product={product} variant={selected} quantity={quantity} onAdded={onAdded} />
        </div>
      </div>

      <p className="-mt-2 flex items-center justify-center gap-1.5 text-xs opacity-70">
        <Truck size={13} className="flex-shrink-0" />
        {t("shipsIn")}
      </p>

      <StickyAddToBag
        product={product}
        variant={selected}
        quantity={quantity}
        inlineCtaRef={inlineCtaRef}
      />
    </div>
  );
}
