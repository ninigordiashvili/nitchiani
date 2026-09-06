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
 * On a pointer device it widens into a labelled pill while the card is hovered, so the
 * gesture names itself instead of leaving a bare "+" to be guessed at.
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

  // Sold out expands too, to say so. A grey circle that does nothing on hover reads as a
  // broken button; "Out of stock" reads as the reason.
  const label = soldOut ? t("outOfStock") : deferToSheet ? t("quickView") : t("addToCart");

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
      aria-label={label}
      className={cn(
        // No fixed width: 9px of padding either side of an 18px icon makes a 36px circle,
        // and the label growing from zero is what turns it into a pill.
        "flex h-9 items-center justify-center overflow-hidden rounded-full px-[9px]",
        "bg-[var(--color-brand-ink)] text-[var(--color-brand-cream)]",
        soldOut ? "cursor-not-allowed opacity-40" : "cursor-pointer active:scale-95",
        "transition-transform",
        className,
      )}
    >
      <Plus size={18} strokeWidth={1.8} className="shrink-0" />
      {/* Present in the DOM at every size so the button keeps one accessible name, and
          revealed by width rather than by mounting — an element that appears on hover can't
          animate, and the card would jump.

          Gated on `hover: hover` so it never fires on a touch screen, where a tap leaves a
          sticky hover state and the pill would stay open over the card after adding. */}
      <span
        className={cn(
          "max-w-0 whitespace-nowrap text-xs font-medium opacity-0",
          "transition-[max-width,opacity,margin] duration-300 ease-[var(--ease-brand)]",
          "[@media(hover:hover)]:group-hover:ml-1.5",
          "[@media(hover:hover)]:group-hover:max-w-[10rem]",
          "[@media(hover:hover)]:group-hover:opacity-100",
        )}
      >
        {label}
      </span>
    </button>
  );
}
