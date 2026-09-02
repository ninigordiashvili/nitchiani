"use client";

import { useTranslations } from "next-intl";
import type { Product, ProductVariant } from "@/lib/shopify/types";
import { useCart } from "@/lib/cart/store";
import { useToast } from "@/lib/ui/toast";
import { cn } from "@/lib/utils";

export function AddToBagButton({
  product,
  variant,
  quantity = 1,
  className,
  onAdded,
}: {
  product: Product;
  variant: ProductVariant;
  quantity?: number;
  className?: string;
  /** Fires after a successful add — the quick-view sheet uses it to close itself. */
  onAdded?: () => void;
}) {
  const t = useTranslations("product");
  const cart = useCart();
  const toast = useToast();

  const disabled = !variant.availableForSale;

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => {
        cart.addLine({
          variantId: variant.id,
          productHandle: product.handle,
          productTitle: product.title,
          variantTitle: variant.title,
          image: product.featuredImage,
          unitPrice: variant.price,
          quantity,
        });
        // Adding is otherwise invisible: the drawer doesn't open and, from the quick view,
        // the sheet is about to close. The toast is the only confirmation the shopper gets.
        toast.show(t("addedToBag"));
        onAdded?.();
      }}
      className={cn("btn-primary w-full", disabled && "opacity-50 cursor-not-allowed", className)}
    >
      {disabled ? t("outOfStock") : t("addToBag")}
    </button>
  );
}
