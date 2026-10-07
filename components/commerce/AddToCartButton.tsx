"use client";

import { useTranslations } from "next-intl";
import type { Product, ProductVariant } from "@/lib/shopify/types";
import { useCart } from "@/lib/cart/store";
import { useSoldOut } from "@/lib/cart/sold-out";
import { useToast } from "@/lib/ui/toast";
import { cn } from "@/lib/utils";

export function AddToCartButton({
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

  // Also sold out when this visit has already found it so — see lib/cart/sold-out.ts.
  const knownSoldOut = useSoldOut();
  const soldOut = !variant.availableForSale || knownSoldOut(product.handle);
  // How many more the bag can take. When it already holds every unit in stock, the button
  // says so instead of claiming to add one more that the bag would refuse.
  const room = cart.canAdd(variant.id, variant.quantityAvailable);
  const allInBag = !soldOut && room === 0;
  const disabled = soldOut || allInBag;

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => {
        const added = cart.addLine({
          variantId: variant.id,
          productHandle: product.handle,
          productTitle: product.title,
          variantTitle: variant.title,
          image: product.featuredImage,
          unitPrice: variant.price,
          maxQuantity: variant.quantityAvailable,
          quantity,
        });
        // Adding is otherwise invisible: the drawer doesn't open and, from the quick view,
        // the sheet is about to close. The toast is the only confirmation the shopper gets —
        // so it says what really happened, never "added" when the bag was already full.
        if (added === 0) {
          toast.show(t("allInBag"));
          return;
        }
        toast.show(added < quantity ? t("addedPartly", { count: added }) : t("addedToCart"));
        onAdded?.();
      }}
      className={cn("btn-primary w-full", disabled && "opacity-50 cursor-not-allowed", className)}
    >
      {soldOut ? t("outOfStock") : allInBag ? t("inBagMax") : t("addToCart")}
    </button>
  );
}
