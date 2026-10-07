"use client";

import { AlertCircle, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCart } from "@/lib/cart/store";
import { cn } from "@/lib/utils";

/**
 * Says why something vanished from the bag. The cart drops products the shop no longer sells
 * as it loads; doing that silently would read as the site losing the shopper's items.
 */
export function RemovedUnavailableNotice({ className }: { className?: string }) {
  const t = useTranslations("cart");
  const { removedUnavailable, removedSoldOut, dismissRemovedUnavailable } = useCart();
  if (removedUnavailable.length === 0 && removedSoldOut.length === 0) return null;

  return (
    <div
      role="status"
      className={cn("flex items-start gap-2 rounded-md px-3 py-2.5 text-left text-xs", className)}
      style={{
        background: "color-mix(in oklab, var(--color-brand-maroon) 10%, transparent)",
        color: "var(--color-brand-maroon-3)",
        border: "1px solid color-mix(in oklab, var(--color-brand-maroon) 30%, transparent)",
      }}
    >
      <AlertCircle size={14} className="mt-0.5 flex-shrink-0" aria-hidden />
      <div className="flex-1 space-y-1">
        {removedSoldOut.length > 0 ? (
          <p>
            {t("removedSoldOut", {
              products: removedSoldOut.join(", "),
              count: removedSoldOut.length,
            })}
          </p>
        ) : null}
        {removedUnavailable.length > 0 ? (
          <p>
            {t("removedUnavailable", {
              products: removedUnavailable.join(", "),
              count: removedUnavailable.length,
            })}
          </p>
        ) : null}
      </div>
      <button
        type="button"
        onClick={dismissRemovedUnavailable}
        aria-label={t("dismiss")}
        className="-m-1 flex h-6 w-6 flex-shrink-0 cursor-pointer items-center justify-center opacity-70 hover:opacity-100"
      >
        <X size={14} />
      </button>
    </div>
  );
}
