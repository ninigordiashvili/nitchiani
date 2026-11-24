import type { Product, ProductVariant } from "@/lib/shopify/types";
import type { GaItem } from "./ga";

/** GA4 item for a product, optionally narrowed to one variant. Facts about the product only. */
export function gaItem(product: Product, variant?: ProductVariant, quantity?: number): GaItem {
  return {
    item_id: product.handle,
    item_name: product.title,
    ...(variant ? { item_variant: variant.title } : {}),
    item_category: product.productTypeHandle,
    price: Number.parseFloat((variant?.price ?? product.priceRange.min).amount),
    ...(quantity ? { quantity } : {}),
  };
}
