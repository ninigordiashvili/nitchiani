"use client";

import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useQuickView } from "@/lib/ui/quick-view";
import type { Product } from "@/lib/shopify/types";
import { cn } from "@/lib/utils";

/**
 * Plus-icon button that pops the quick-view sheet for a product. Sits in the bottom-right of
 * the product image, intentionally subtle so it doesn't fight the wishlist heart (top-right) or
 * the badges (top-left).
 *
 * stopPropagation + preventDefault so tapping doesn't navigate to the PDP that the parent Link
 * would otherwise trigger.
 */
export function QuickViewButton({
  product,
  className,
}: {
  product: Product;
  className?: string;
}) {
  const t = useTranslations("product");
  const quickView = useQuickView();

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        quickView.open(product);
      }}
      aria-label={t("quickView")}
      className={cn(
        "flex h-9 w-9 cursor-pointer items-center justify-center rounded-full backdrop-blur-sm transition-colors",
        "bg-[var(--color-brand-cream)]/80 hover:bg-[var(--color-brand-cream)] text-[var(--color-brand-ink)]",
        className,
      )}
    >
      <Plus size={18} strokeWidth={1.8} />
    </button>
  );
}
