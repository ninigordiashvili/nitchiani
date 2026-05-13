"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Check } from "lucide-react";
import type { Product, ProductVariant } from "@/lib/shopify/types";
import { useCart } from "@/lib/cart/store";
import { cn } from "@/lib/utils";

export function AddToBagButton({
  product,
  variant,
  quantity = 1,
  className,
}: {
  product: Product;
  variant: ProductVariant;
  quantity?: number;
  className?: string;
}) {
  const t = useTranslations("product");
  const cart = useCart();
  const [justAdded, setJustAdded] = useState(false);

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
        setJustAdded(true);
        setTimeout(() => setJustAdded(false), 1400);
      }}
      className={cn("btn-primary w-full", disabled && "opacity-50 cursor-not-allowed", className)}
    >
      {disabled ? (
        t("outOfStock")
      ) : justAdded ? (
        <>
          <Check size={16} /> {t("addToBag")}
        </>
      ) : (
        t("addToBag")
      )}
    </button>
  );
}
