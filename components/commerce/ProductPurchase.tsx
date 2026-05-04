"use client";

import { useState } from "react";
import type { Product } from "@/lib/shopify/types";
import { AddToBagButton } from "./AddToBagButton";
import { PriceDisplay } from "./PriceDisplay";
import { VariantPicker } from "./VariantPicker";

/**
 * Owns the selected variant on a PDP. Composes price + picker + add-to-bag so they all stay in sync
 * when the user picks a different size/color/length.
 *
 * Picker self-hides for single-SKU products (the price + Add to bag still render).
 */
export function ProductPurchase({ product }: { product: Product }) {
  const [selected, setSelected] = useState(
    product.variants.find((v) => v.availableForSale) ?? product.variants[0],
  );

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
      />

      <AddToBagButton product={product} variant={selected} />
    </div>
  );
}
