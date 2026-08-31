"use client";

import { ArrowRight, X } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useEffect, useRef } from "react";
import { Link } from "@/lib/i18n/routing";
import { BLUR_DATA_URL } from "@/lib/images";
import { useFocusTrap } from "@/lib/ui/use-focus-trap";
import { useOverlays } from "@/lib/ui/overlays";
import { useQuickView } from "@/lib/ui/quick-view";
import { useSwipeDismiss } from "@/lib/ui/use-swipe-dismiss";
import { ProductPurchase } from "./ProductPurchase";

/**
 * Slide-up quick-view sheet. Mounted once at the layout level; reads `product` from the shared
 * QuickViewProvider. When `product` is non-null, the sheet slides in from the bottom with a
 * scrim. Reuses the same `<ProductPurchase>` block as the PDP so variant selection + add-to-bag
 * are perfectly consistent.
 *
 * Note the search overlay: `SearchOverlay` closes itself by catching bubbled clicks on its
 * results grid, but `QuickViewButton` stops propagation so tapping it doesn't also trigger
 * the card's `<Link>`. That leaves search mounted behind this sheet — correct while the sheet
 * is open (dismissing it should return you to your results), wrong the moment we navigate
 * away. So only the "View full details" link closes both.
 */
export function QuickViewModal() {
  const t = useTranslations();
  const quickView = useQuickView();
  const overlays = useOverlays();
  const product = quickView.product;
  const open = product !== null;
  const { dragOffset, handlers } = useSwipeDismiss({
    direction: "down",
    onDismiss: quickView.close,
    // Centred on sm+; only the bottom-sheet variant on mobile is swipe-dismissable.
    maxViewportWidth: 640,
  });
  const modalRef = useRef<HTMLElement>(null);
  useFocusTrap(modalRef, open);

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
        ref={modalRef}
        {...handlers}
        role="dialog"
        aria-modal="true"
        aria-label={product?.title}
        className="absolute right-0 bottom-0 left-0 max-h-[88dvh] overflow-y-auto rounded-t-2xl transition-transform duration-200 ease-[var(--ease-brand)] sm:right-1/2 sm:bottom-1/2 sm:left-1/2 sm:max-h-none sm:w-[min(900px,90vw)] sm:translate-x-[-50%] sm:translate-y-[50%] sm:overflow-hidden sm:rounded-2xl"
        style={{
          background: "var(--surface)",
          transform: open
            ? dragOffset > 0
              ? `translateY(${dragOffset}px)`
              : undefined
            : "translateY(100%)",
          ...(dragOffset > 0 ? { transition: "none" } : {}),
        }}
      >
        {product ? (
          <div className="flex flex-col sm:grid sm:grid-cols-2">
            {/* Image */}
            <div className="relative aspect-square w-full bg-white sm:rounded-l-2xl sm:rounded-tr-none">
              <Image
                src={product.featuredImage.url}
                alt={product.featuredImage.altText}
                fill
                sizes="(min-width: 640px) 50vw, 100vw"
                placeholder="blur"
                blurDataURL={BLUR_DATA_URL}
                className="object-contain sm:rounded-l-2xl"
              />
              <button
                type="button"
                onClick={quickView.close}
                aria-label={t("search.closeAria")}
                className="absolute top-3 right-3 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full backdrop-blur-sm sm:hidden"
                style={{ background: "color-mix(in srgb, var(--surface) 90%, transparent)" }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Details */}
            <div className="relative flex flex-col p-5 sm:p-7">
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
                <ProductPurchase product={product} showSizeGuide={false} />
              </div>

              <Link
                href={`/products/${product.handle}`}
                onClick={() => {
                  quickView.close();
                  overlays.setSearchOpen(false);
                }}
                className="mt-auto inline-flex items-center gap-1 self-center pt-6 text-xs font-medium tracking-[0.16em] uppercase opacity-80 hover:opacity-100"
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
