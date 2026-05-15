"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { useCart } from "@/lib/cart/store";
import type { Product } from "@/lib/shopify/types";
import { cn } from "@/lib/utils";

/**
 * Compact circular "+" button that skips the PDP and pushes the first available variant
 * directly into the cart. Designed to live as an overlay on product card images and
 * upsell-rail thumbnails — short path to purchase for IG-driven traffic who already know
 * what they want.
 *
 * For single-SKU products this is unambiguous. For multi-variant products the caller
 * should generally prefer `QuickViewButton` instead so the user can pick a variant — but
 * this component still works (it picks "first available") for places like the cart upsell
 * rail where best-default-add is acceptable.
 *
 * `e.preventDefault() + e.stopPropagation()` is mandatory because the parent card is a
 * `<Link>` to the PDP — without it, every quick-add also navigates away.
 */
export function QuickAddButton({
  product,
  size = 32,
  className,
}: {
  product: Product;
  /** Diameter in px. 32 is the default for product cards; 28 fits tighter upsell thumbnails. */
  size?: number;
  className?: string;
}) {
  const t = useTranslations("product");
  const cart = useCart();
  const [justAdded, setJustAdded] = useState(false);

  const variant =
    product.variants.find((v) => v.availableForSale) ?? product.variants[0];
  if (!variant) return null;

  const disabled = !variant.availableForSale;

  const onClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;
    cart.addLine({
      variantId: variant.id,
      productHandle: product.handle,
      productTitle: product.title,
      variantTitle: variant.title,
      image: product.featuredImage,
      unitPrice: variant.price,
    });
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1200);
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={t("addToBag")}
      className={cn(
        "flex cursor-pointer items-center justify-center rounded-full transition-all backdrop-blur-sm",
        disabled && "cursor-not-allowed opacity-40",
        className,
      )}
      style={{
        width: size,
        height: size,
        background: justAdded
          ? "var(--color-brand-maroon)"
          : "var(--color-brand-ink)",
        color: "var(--color-brand-cream)",
        transform: justAdded ? "scale(1.1)" : "scale(1)",
      }}
    >
      <Plus
        size={Math.round(size * 0.5)}
        style={{
          transform: justAdded ? "rotate(45deg)" : "rotate(0deg)",
          transition: "transform 0.2s var(--ease-brand)",
        }}
      />
    </button>
  );
}
