"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { BLUR_DATA_URL } from "@/lib/images";
import type { ImageRef } from "@/lib/shopify/types";
import { cn } from "@/lib/utils";

export function ProductGallery({ images, title }: { images: ImageRef[]; title: string }) {
  const t = useTranslations("nav");
  const [active, setActive] = useState(0);
  const current = images[active] ?? images[0];

  return (
    <div className="lg:flex lg:gap-4">
      {images.length > 1 ? (
        <ul className="order-2 mt-3 flex gap-2 overflow-x-auto lg:order-1 lg:mt-0 lg:flex-col">
          {images.map((img, i) => (
            // Keyed by position, not URL: a gallery may legitimately repeat the same shot,
            // and duplicate keys would make React reuse the wrong thumbnail on re-render.
            <li key={`${img.url}-${i}`}>
              <button
                type="button"
                onClick={() => setActive(i)}
                aria-label={t("showImage", { n: i + 1 })}
                className={cn(
                  "relative h-16 w-16 flex-shrink-0 overflow-hidden border bg-white transition-colors",
                  i === active
                    ? "border-[var(--color-brand-ink)]"
                    : "border-transparent opacity-60 hover:opacity-100",
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
