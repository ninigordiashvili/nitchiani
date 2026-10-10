"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { BLUR_DATA_URL } from "@/lib/images";
import type { ImageRef } from "@/lib/shopify/types";
import { cn } from "@/lib/utils";

/**
 * The photos on a product card, browsable in place.
 *
 * A card used to show one shot, and the only way to the others was to open the card — so the
 * second angle, the colour that is actually in stock, the pack shot, all went unseen by anyone
 * who didn't tap first. Here the rail is a native horizontal scroller: a thumb swipes it on a
 * phone, and on a pointer device the arrows appear on hover, since there is nothing to swipe
 * with. Dots say how many there are and where you are.
 *
 * Every control stops the click from reaching the card's link, which otherwise opens quick
 * view — browsing the photos is the one gesture here that should not navigate.
 */
export function CardPhotos({
  images,
  alt,
  sizes,
  priority = false,
}: {
  images: ImageRef[];
  alt: string;
  sizes: string;
  priority?: boolean;
}) {
  const t = useTranslations("product");
  const tNav = useTranslations("nav");
  const railRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  // The other slides are markup until someone reaches for them. Rendering all of them up
  // front put 358 KB of off-screen product photos on the shop page — 45% of its image weight
  // — for a rail most shoppers never touch. Hover or the first touch is enough warning.
  const [woken, setWoken] = useState(false);
  const wake = () => setWoken(true);

  const scrollTo = (i: number) => {
    const rail = railRef.current;
    if (!rail) return;
    wake();
    const index = Math.max(0, Math.min(images.length - 1, i));
    rail.scrollTo({ left: rail.clientWidth * index, behavior: "smooth" });
    // Set it here as well as on scroll: the dots should answer the tap immediately rather
    // than when the smooth scroll gets there.
    setActive(index);
  };

  // Browsing is not navigating. Without this, every arrow and dot would also open quick view.
  const control = (fn: () => void) => (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    fn();
  };

  return (
    <>
      <div
        ref={railRef}
        onPointerEnter={wake}
        onTouchStart={wake}
        onFocus={wake}
        onScroll={(e) => {
          wake();
          const rail = e.currentTarget;
          if (rail.clientWidth > 0) setActive(Math.round(rail.scrollLeft / rail.clientWidth));
        }}
        className="no-scrollbar absolute inset-0 flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain"
      >
        {images.map((img, i) => (
          // Keyed by position as well as URL: a gallery may repeat a shot, and duplicate keys
          // would have React reuse the wrong slide.
          // `overflow-hidden` per slide, not just on the card: the hover zoom below grows the
          // photo past its own slide, and without this it bled over the one beside it.
          <div
            key={`${img.url}-${i}`}
            className="relative h-full w-full flex-shrink-0 snap-center overflow-hidden"
          >
            {i === 0 || woken ? (
              <Image
                src={img.url}
                // Only the first shot names the product; the rest are the same thing from
                // another angle, and a screen reader reading the name four times says nothing
                // new.
                alt={i === 0 ? alt : ""}
                fill
                sizes={sizes}
                priority={priority && i === 0}
                placeholder="blur"
                blurDataURL={BLUR_DATA_URL}
                className="object-contain transition-transform duration-[400ms] ease-[var(--ease-brand)] group-hover:scale-[1.025]"
              />
            ) : null}
          </div>
        ))}
      </div>

      {/* Pointer devices only: a mouse can't swipe, and on a phone these would sit on top of
          the photo for no reason. */}
      <button
        type="button"
        onClick={control(() => scrollTo(active - 1))}
        aria-label={t("prevImage")}
        disabled={active === 0}
        className="absolute top-1/2 left-1.5 hidden h-7 w-7 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/90 text-[var(--color-brand-ink)] opacity-0 shadow-sm transition-opacity hover:bg-white focus-visible:opacity-100 group-hover:opacity-100 disabled:cursor-default disabled:opacity-0 sm:flex"
      >
        <ChevronLeft size={16} />
      </button>
      <button
        type="button"
        onClick={control(() => scrollTo(active + 1))}
        aria-label={t("nextImage")}
        disabled={active === images.length - 1}
        className="absolute top-1/2 right-1.5 hidden h-7 w-7 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/90 text-[var(--color-brand-ink)] opacity-0 shadow-sm transition-opacity hover:bg-white focus-visible:opacity-100 group-hover:opacity-100 disabled:cursor-default disabled:opacity-0 sm:flex"
      >
        <ChevronRight size={16} />
      </button>

      {/* Left of centre, clear of the add button in the bottom-right corner. */}
      <ul className="pointer-events-none absolute inset-x-0 bottom-2.5 flex justify-center gap-1.5 pr-10 pl-2">
        {images.map((img, i) => (
          <li key={`dot-${img.url}-${i}`}>
            <button
              type="button"
              onClick={control(() => scrollTo(i))}
              aria-label={tNav("showImage", { n: i + 1 })}
              aria-current={i === active}
              className={cn(
                "pointer-events-auto block h-1.5 w-1.5 cursor-pointer rounded-full transition-all",
                i === active
                  ? "w-3.5 bg-[var(--color-brand-ink)]"
                  : "bg-[var(--color-brand-ink)]/25 hover:bg-[var(--color-brand-ink)]/50",
              )}
            />
          </li>
        ))}
      </ul>
    </>
  );
}
