"use client";

import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useQuickView } from "@/lib/ui/quick-view";
import type { Product } from "@/lib/shopify/types";
import { cn } from "@/lib/utils";

/**
 * Plus-icon button on product cards. Opens the quick-view sheet for the product — applies to
 * every product card regardless of variant count so the funnel is uniform: card click → quick
 * view → user decides between "Add to bag" and "View full details".
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
        "flex h-9 w-9 cursor-pointer items-center justify-center rounded-full transition-transform",
        "bg-[var(--color-brand-ink)] text-[var(--color-brand-cream)] hover:scale-105",
        className,
      )}
    >
      <Plus size={18} strokeWidth={1.8} />
    </button>
  );
}
