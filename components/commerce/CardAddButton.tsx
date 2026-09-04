"use client";

import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCart } from "@/lib/cart/store";
import { useQuickView } from "@/lib/ui/quick-view";
import { useToast } from "@/lib/ui/toast";
import type { Product } from "@/lib/shopify/types";
import { cn } from "@/lib/utils";

/**
 * Plus button on a product card. Adds straight to the bag and confirms with a toast — the
 * card itself (image, title, price) is what opens the quick view, so the two gestures do
 * different things instead of both landing in the same sheet.
 *
 * Sold out disables it outright — EchoDesk rejects the whole order at checkout if the bag
 * holds more than it can ship, and the shopper should never get that far. More than one
 * variant defers to the sheet instead: picking the first colour or length for them is not a
 * shortcut, it's the wrong item in the bag. No product has variants today, so that branch
 * changes nothing now and stays correct when they do.
 *
 * stopPropagation + preventDefault so tapping doesn't also trigger the card's `<Link>`.
 */
export function CardAddButton({
  product,
  className,
}: {
  product: Product;
  className?: string;
}) {
  const t = useTranslations("product");
  const quickView = useQuickView();
  const cart = useCart();
  const toast = useToast();

  // Prefer a variant that can actually be sold, so a product whose first colour is gone is
  // still buyable from the card.
  const variant = product.variants.find((v) => v.availableForSale) ?? product.variants[0];
  const soldOut = !variant?.availableForSale;
  // More than one variant is a genuine choice, so the sheet handles it. Sold out is not a
  // choice — the button refuses instead.
  const deferToSheet = !soldOut && product.variants.length > 1;

  return (
    <button
      type="button"
      disabled={soldOut}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (soldOut || !variant) return;
        if (deferToSheet) {
          quickView.open(product);
          return;
        }
        cart.addLine({
          variantId: variant.id,
          productHandle: product.handle,
          productTitle: product.title,
          variantTitle: variant.title,
          image: product.featuredImage,
          unitPrice: variant.price,
          maxQuantity: variant.quantityAvailable,
          quantity: 1,
        });
        // The drawer deliberately stays shut, so the toast is the only sign it worked.
        toast.show(t("addedToBag"));
      }}
      aria-label={soldOut ? t("outOfStock") : deferToSheet ? t("quickView") : t("addToBag")}
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-full transition-transform",
        "bg-[var(--color-brand-ink)] text-[var(--color-brand-cream)]",
        soldOut
          ? "cursor-not-allowed opacity-30"
          : "cursor-pointer hover:scale-105",
        className,
      )}
    >
      <Plus size={18} strokeWidth={1.8} />
    </button>
  );
}
