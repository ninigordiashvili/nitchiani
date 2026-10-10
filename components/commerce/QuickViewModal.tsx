"use client";

import { ArrowRight, X } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "@/lib/i18n/routing";
import { cn } from "@/lib/utils";
import { BLUR_DATA_URL, distinctImages, variantPhotos } from "@/lib/images";
import { useFocusTrap } from "@/lib/ui/use-focus-trap";
import { useOverlays } from "@/lib/ui/overlays";
import { useQuickView } from "@/lib/ui/quick-view";
import { showPhotoOnScreen, useVariantPhoto } from "@/lib/ui/variant-photo";
import { useSwipeDismiss } from "@/lib/ui/use-swipe-dismiss";
import { ImageLightbox } from "./ImageLightbox";
import { ProductPurchase } from "./ProductPurchase";
import { ZoomablePhoto } from "./ZoomablePhoto";
import { ProductSpecList } from "./ProductSpecList";
import { WishlistButton } from "./WishlistButton";

/**
 * Slide-up quick-view sheet. Mounted once at the layout level; reads `product` from the shared
 * QuickViewProvider. When `product` is non-null, the sheet slides in from the bottom with a
 * scrim. Reuses the same `<ProductPurchase>` block as the PDP so variant selection + add-to-bag
 * are perfectly consistent.
 *
 * Note the search overlay: `SearchOverlay` closes itself by catching bubbled clicks on its
 * results grid, but `CardAddButton` stops propagation so tapping it doesn't also trigger
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

  // Only offer a picker when the extra shots actually differ. Placeholder galleries pad
  // themselves by repeating one photo, and a row of identical thumbnails in a sheet this
  // compact reads as a bug rather than a feature — so the strip stays hidden until real
  // angles exist, then appears on its own. See `distinctImages`.
  const shots = useMemo(
    () => distinctImages([...(product?.images ?? []), ...(product ? variantPhotos(product) : [])]),
    [product],
  );
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const lightboxRef = useRef(false);
  lightboxRef.current = lightbox;

  // Reset when the sheet switches products, or shot 3 of the last product would carry over
  // to one that only has two.
  useEffect(() => {
    setActive(0);
    setLightbox(false);
  }, [product?.handle]);

  // Follow the picker, the same way the PDP gallery does.
  const chosen = useVariantPhoto();
  useEffect(() => {
    if (!chosen) return;
    const i = shots.findIndex((s) => s.url === chosen);
    if (i >= 0) setActive(i);
  }, [chosen, shots]);

  const shown = shots[active] ?? product?.featuredImage;

  // The sheet's own picker is told what is on screen, exactly as on the product page.
  useEffect(() => {
    showPhotoOnScreen(shown?.url ?? null);
    return () => showPhotoOnScreen(null);
  }, [shown]);

  // Body scroll lock + ESC handler.
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      // With the photo viewer open, Escape closes the viewer only — it has its own handler.
      if (e.key === "Escape" && !lightboxRef.current) quickView.close();
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
      inert={!open}
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
        className="absolute right-0 bottom-0 left-0 max-h-[88dvh] overflow-y-auto rounded-t-2xl transition-transform duration-200 ease-[var(--ease-brand)] sm:right-1/2 sm:bottom-1/2 sm:left-1/2 sm:flex sm:min-h-[calc(min(900px,90vw)*0.625)] sm:flex-col sm:max-h-[88dvh] sm:w-[min(900px,90vw)] sm:translate-x-[-50%] sm:translate-y-[50%] sm:overflow-hidden sm:rounded-2xl"
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
          <div className="flex flex-col sm:grid sm:flex-1 sm:grid-cols-2 sm:items-stretch">
            {/* Image. Square on mobile, where it stacks above the details and its own height
                is all it has to fill. On sm+ the sheet is sized so this column is 4:5 — the
                shape the product photos are shot in — and `h-full` fills it exactly. Sizing
                the sheet from the details column instead left the photo adrift in a tall
                white panel with empty bands above and below it. */}
            <ZoomablePhoto
              image={shown ?? product.featuredImage}
              alt={shown?.altText || product.featuredImage.altText || product.title}
              sizes="(min-width: 640px) 50vw, 100vw"
              // No "hover to zoom" pill here: it sat over the product in a panel opened to
              // look at the product. The photo still zooms, and the thumbnails below say it
              // is a gallery.
              showHint={false}
              onOpen={() => setLightbox(true)}
              onNavigate={
                shots.length > 1
                  ? (d) => setActive((i) => (i + d + shots.length) % shots.length)
                  : undefined
              }
              className="aspect-square w-full sm:aspect-auto sm:h-full sm:rounded-l-2xl sm:rounded-tr-none"
              imageClassName="sm:rounded-l-2xl"
            >

              {/* Overlaid on the image rather than stacked beneath it: the sheet is capped at
                  88dvh on mobile and the space below the fold belongs to the variant picker and
                  Add to Bag. A strip in the flow would push those down; this costs no height. */}
              {/* `no-scrollbar`: this strip sits on top of the photograph, and a grey system
                  scrollbar drawn across it reads as a broken frame rather than a control.
                  `justify-center-safe` because a product with eight colours overflows, and
                  plain centring puts the first thumbnails past the left edge where no amount
                  of scrolling reaches them. */}
              {shots.length > 1 ? (
                <ul className="no-scrollbar absolute inset-x-3 bottom-3 flex snap-x snap-mandatory justify-center-safe gap-2 overflow-x-auto">
                  {shots.map((shot, i) => (
                    <li key={`${shot.url}-${i}`}>
                      <button
                        type="button"
                        onClick={() => setActive(i)}
                        aria-label={t("nav.showImage", { n: i + 1 })}
                        aria-current={i === active}
                        className={cn(
                          "relative h-12 w-12 flex-shrink-0 cursor-pointer overflow-hidden rounded-md border-2 bg-white transition-all",
                          i === active
                            ? "border-[var(--color-brand-ink)]"
                            // Unselected shots keep a hairline edge and near-full opacity. At
                            // opacity-60 with a transparent border they were product photos on
                            // white sitting on a white tile — barely there, so the strip read as
                            // one image rather than a picker.
                            : "border-[var(--border-soft)] opacity-90 hover:border-[var(--color-brand-ink)] hover:opacity-100",
                        )}
                      >
                        <Image
                          src={shot.url}
                          alt=""
                          fill
                          sizes="48px"
                          placeholder="blur"
                          blurDataURL={BLUR_DATA_URL}
                          className="object-contain"
                        />
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}
              <button
                type="button"
                onClick={quickView.close}
                aria-label={t("search.closeAria")}
                className="absolute top-3 right-3 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full backdrop-blur-sm sm:hidden"
                style={{ background: "color-mix(in srgb, var(--surface) 90%, transparent)" }}
              >
                <X size={18} />
              </button>
            </ZoomablePhoto>

            {lightbox ? (
              <ImageLightbox
                images={shots.length > 0 ? shots : [product.featuredImage]}
                index={active}
                title={product.title}
                onIndexChange={setActive}
                onClose={() => setLightbox(false)}
              />
            ) : null}

            {/* Details */}
            {/* `sm:pt-14` clears the close button above: it sits at top-3 and is 36px tall,
                so it occupies the first 48px of this panel — more than the 28px of `sm:p-7`.
                Without it the title row, and the heart on it, ride up underneath the X. Mobile
                keeps p-5 because there the close button is over the image, not in here. */}
            {/* Two layers: the close button stays put while the copy below it scrolls. One
                scrolling div with the button inside would have carried the X off the top of
                the sheet the moment a long description moved. */}
            <div className="relative flex min-h-0 flex-col sm:h-full">
              <button
                type="button"
                onClick={quickView.close}
                aria-label={t("search.closeAria")}
                className="absolute top-3 right-3 z-10 hidden h-9 w-9 cursor-pointer items-center justify-center sm:flex"
              >
                <X size={18} />
              </button>

              {/* Scrolls on its own when the copy outruns the photo's height, which is what
                  keeps the sheet 4:5 rather than growing to fit a long product name. */}
              {/* `justify-center-safe`, not `justify-center`: a centred flex column that
                  overflows its scroll box pushes its first child past the top edge, where no
                  amount of scrolling reaches it. Safe centring gives up and aligns to the
                  start once the content no longer fits. */}
              <div className="flex flex-col justify-center-safe p-5 sm:h-full sm:overflow-y-auto sm:p-7 sm:pt-14">
                {product.productType ? (
                  <p className="label-eyebrow mb-2">{product.productType}</p>
                ) : (
                  // Reserve the eyebrow's height when a product has no category. Otherwise the
                  // title row — and the heart on it — rides 24px higher for those products only,
                  // leaving 18px to the close button instead of 43px. Products from EchoDesk
                  // carry no productType today, so that was the common case, not the edge one.
                  <div aria-hidden className="mb-2 h-4" />
                )}
                {/* Favourites sits beside the title rather than over the artwork: the heart's
                    translucent pill is designed for the tinted product cards and all but vanished
                    against a white product photo. On the cream panel the maroon reads clearly, and
                    the hairline border makes it legible as a control rather than decoration. */}
                <div className="flex items-start justify-between gap-3">
                  {/* Smaller on a phone: a long Georgian name ran to three lines here and pushed
                      the price and the buy button off the first screen. */}
                  <h2 className="font-display line-clamp-3 text-lg leading-snug tracking-tight sm:line-clamp-2 sm:text-2xl sm:leading-tight">
                    {product.title}
                  </h2>
                  <WishlistButton
                    handle={product.handle}
                    size={20}
                    className="mt-0.5 shrink-0 border border-[var(--border-soft)]"
                  />
                </div>

                {/* `mt-auto` moves here from the link below, which pushes the purchase controls
                    to the foot of the panel and puts the slack above them instead. The panel is
                    as tall as the product image beside it, so on a short product the quantity
                    stepper and Add to bag were floating in the middle with dead space under
                    them; anchored low they sit where the eye ends up and near the thumb. */}
                {/* The three facts that decide whether this is the right product at all. Quick
                    view exists so a shopper can answer that without leaving the grid — without
                    them the sheet shows a name and a price, which is what the card already
                    showed. Capped tighter than the PDP because this panel is short. */}
                <ProductSpecList attributes={product.attributes} limit={2} />

                {/* `mt-auto` was pushing the purchase block to the foot of the panel, which on a
                    short product opened a gap under the specs. With the spec list filling that
                    space the slack reads as a layout bug rather than breathing room. */}
                <div className="pt-5">
                  <ProductPurchase
                    product={product}
                    showSizeGuide={false}
                    compact
                    onAdded={quickView.close}
                  />
                </div>

                <Link
                  href={`/products/${product.handle}`}
                  onClick={() => {
                    quickView.close();
                    overlays.setSearchOpen(false);
                  }}
                  className="group inline-flex items-center gap-1 self-center pt-4 text-xs font-medium tracking-[0.16em] uppercase opacity-80 hover:opacity-100"
                >
                  <span className="underline-motion">{t("product.viewFullDetails")}</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        ) : null}
      </aside>
    </div>
  );
}
