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
 * It defers to the quick view in the two cases where adding on the customer's behalf would
 * be a guess or a dead end:
 *
 *  - More than one variant. Picking the first colour or length for them is not a shortcut,
 *    it's the wrong item in the bag. No product in the catalogue has variants today, so this
 *    changes nothing now and stays correct when they do.
 *  - Nothing purchasable. A plus that silently does nothing reads as broken; the sheet shows
 *    the shopper it's out of stock.
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

  const variant = product.variants[0];
  const deferToSheet = product.variants.length > 1 || !variant?.availableForSale;

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (deferToSheet || !variant) {
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
          quantity: 1,
        });
        // The drawer deliberately stays shut, so the toast is the only sign it worked.
        toast.show(t("addedToBag"));
      }}
      aria-label={deferToSheet ? t("quickView") : t("addToBag")}
      className={cn(
        "flex h-9 w-9 cursor-pointer items-center justify-center rounded-full transition-transform",
        "bg-[var(--color-brand-ink)] text-[var(--color-brand-cream)] hover:scale-105",
        className,
      )}
    >
      <Plus size={18} strokeWidth={1.8} />
    </button>
  );
}
