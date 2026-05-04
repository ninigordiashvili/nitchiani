"use client";

import { ArrowRight, X } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { Link } from "@/lib/i18n/routing";
import { useQuickView } from "@/lib/ui/quick-view";
import { ProductPurchase } from "./ProductPurchase";

/**
 * Slide-up quick-view sheet. Mounted once at the layout level; reads `product` from the shared
 * QuickViewProvider. When `product` is non-null, the sheet slides in from the bottom with a
 * scrim. Reuses the same `<ProductPurchase>` block as the PDP so variant selection + add-to-bag
 * are perfectly consistent.
 */
export function QuickViewModal() {
  const t = useTranslations();
  const quickView = useQuickView();
  const product = quickView.product;
  const open = product !== null;

  // Body scroll lock + ESC handler.
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") quickView.close();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, quickView]);

  return (
    <div
      aria-hidden={!open}
      className="fixed inset-0 z-50 transition-opacity"
      style={{ opacity: open ? 1 : 0, pointerEvents: open ? "auto" : "none" }}
    >
      <div
        className="absolute inset-0"
        style={{ background: "rgba(10,31,31,0.55)" }}
        onClick={quickView.close}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={product?.title}
        className="absolute right-0 bottom-0 left-0 max-h-[88dvh] overflow-y-auto rounded-t-2xl transition-transform duration-300 ease-[var(--ease-brand)] sm:right-1/2 sm:bottom-1/2 sm:left-1/2 sm:max-h-[80dvh] sm:w-[min(900px,90vw)] sm:translate-x-[-50%] sm:translate-y-[50%] sm:rounded-2xl"
        style={{
          background: "var(--color-brand-cream)",
          transform: open ? undefined : "translateY(100%)",
        }}
      >
        {product ? (
          <div className="flex flex-col sm:grid sm:grid-cols-2">
            {/* Image */}
            <div className="relative aspect-square w-full bg-black/5 sm:rounded-l-2xl sm:rounded-tr-none">
              <Image
                src={product.featuredImage.url}
                alt={product.featuredImage.altText}
                fill
                sizes="(min-width: 640px) 50vw, 100vw"
                className="object-cover sm:rounded-l-2xl"
              />
              <button
                type="button"
                onClick={quickView.close}
                aria-label={t("search.closeAria")}
                className="absolute top-3 right-3 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-[var(--color-brand-cream)]/90 backdrop-blur-sm sm:hidden"
              >
                <X size={18} />
              </button>
            </div>

            {/* Details */}
            <div className="relative p-5 sm:p-7">
              <button
                type="button"
                onClick={quickView.close}
                aria-label={t("search.closeAria")}
                className="absolute top-3 right-3 hidden h-9 w-9 cursor-pointer items-center justify-center sm:flex"
              >
                <X size={18} />
              </button>

              <p className="label-eyebrow mb-2">{product.productType}</p>
              <h2 className="font-display text-2xl leading-tight tracking-tight sm:text-3xl">
                {product.title}
              </h2>

              <div className="mt-5">
                <ProductPurchase product={product} />
              </div>

              <Link
                href={`/products/${product.handle}`}
                onClick={quickView.close}
                className="mt-6 inline-flex items-center gap-1 text-xs font-medium tracking-[0.16em] uppercase opacity-80 hover:opacity-100"
              >
                {t("product.viewFullDetails")}
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        ) : null}
      </aside>
    </div>
  );
}
