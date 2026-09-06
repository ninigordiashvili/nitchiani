"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { BLUR_DATA_URL, distinctImages } from "@/lib/images";
import type { ImageRef } from "@/lib/shopify/types";
import { cn } from "@/lib/utils";

export function ProductGallery({ images, title }: { images: ImageRef[]; title: string }) {
  const t = useTranslations("nav");
  const [active, setActive] = useState(0);
  // Same rule as the quick-view sheet: a thumbnail rail is only worth showing when the shots
  // differ. Placeholder galleries pad themselves by repeating one photo, and a column of
  // identical thumbnails is noise that reads as a bug. Keeping both surfaces on one rule means
  // they can't disagree about whether a product "has" multiple images.
  const shots = useMemo(() => distinctImages(images), [images]);
  const current = shots[active] ?? shots[0];

  return (
    <div className="lg:flex lg:gap-4">
      {shots.length > 1 ? (
        <ul className="order-2 mt-3 flex gap-2 overflow-x-auto lg:order-1 lg:mt-0 lg:flex-col">
          {shots.map((img, i) => (
            // Keyed by position, not URL: a gallery may legitimately repeat the same shot,
            // and duplicate keys would make React reuse the wrong thumbnail on re-render.
            <li key={`${img.url}-${i}`}>
              <button
                type="button"
                onClick={() => setActive(i)}
                aria-label={t("showImage", { n: i + 1 })}
                className={cn(
                  "relative h-16 w-16 flex-shrink-0 overflow-hidden border bg-white transition-all",
                  i === active
                    ? "border-[var(--color-brand-ink)]"
                    // Matches the quick-view strip: a hairline edge and near-full opacity, so
                    // an unselected shot still reads as a thumbnail you can tap.
                    : "border-[var(--border-soft)] opacity-90 hover:border-[var(--color-brand-ink)] hover:opacity-100",
                )}
              >
                <Image
                  src={img.url}
                  alt={img.altText}
                  fill
                  sizes="64px"
                  placeholder="blur"
                  blurDataURL={BLUR_DATA_URL}
                  className="object-contain"
                />
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      <div
        className="relative order-1 aspect-[4/5] w-full self-start overflow-hidden bg-white lg:order-2 lg:flex-1"
        style={{
          // `contain: layout style` isolates this subtree from external reflows so opening
          // a modal / dropdown anywhere on the page can't trigger a re-layout of the gallery.
          // Belt-and-braces with the `scrollbar-gutter: stable` rule on `<html>`.
          contain: "layout style",
        }}
      >
        <Image
          src={current.url}
          alt={current.altText || title}
          fill
          sizes="(min-width: 1024px) 50vw, 100vw"
          priority
          placeholder="blur"
          blurDataURL={BLUR_DATA_URL}
          className="object-contain"
        />
      </div>
    </div>
  );
}
