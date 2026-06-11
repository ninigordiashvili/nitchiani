"use client";

import Image from "next/image";
import { useEffect, useState, type RefObject } from "react";
import type { Product, ProductVariant } from "@/lib/shopify/types";
import { BLUR_DATA_URL, safeImageSrc } from "@/lib/images";
import { useOverlays } from "@/lib/ui/overlays";
import { AddToBagButton } from "./AddToBagButton";
import { PriceDisplay } from "./PriceDisplay";

/**
 * Mobile-only sticky purchase bar on the PDP. Slides in once the inline Add-to-bag
 * button scrolls out of view, slides out when it's back on-screen — never two CTAs at once.
 *
 * While visible, it raises `pdpCtaActive` in the overlays store so BottomNav steps aside;
 * on a product page the next action is purchase, not navigation.
 */
export function StickyAddToBag({
  product,
  variant,
  quantity = 1,
  inlineCtaRef,
}: {
  product: Product;
  variant: ProductVariant;
  quantity?: number;
  inlineCtaRef: RefObject<HTMLDivElement | null>;
}) {
  const { setPdpCtaActive } = useOverlays();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const target = inlineCtaRef.current;
    if (!target) return;
    const io = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting),
      // -10% bottom margin so the bar appears slightly before the inline CTA is fully gone,
      // avoiding a flicker when the user pauses with it half on-screen.
      { threshold: 0, rootMargin: "0px 0px -10% 0px" },
    );
    io.observe(target);
    return () => io.disconnect();
  }, [inlineCtaRef]);

  useEffect(() => {
    setPdpCtaActive(visible);
    return () => setPdpCtaActive(false);
  }, [visible, setPdpCtaActive]);

  return (
    <div
      aria-hidden={!visible}
      className="sm:hidden"
      style={{
        position: "fixed",
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 35,
        paddingBottom: "env(safe-area-inset-bottom)",
        background: "color-mix(in oklab, var(--surface) 96%, transparent)",
        backdropFilter: "blur(8px)",
        borderTop: "1px solid var(--border-soft)",
        transform: visible ? "translateY(0)" : "translateY(100%)",
        transition: "transform 0.25s var(--ease-brand)",
        willChange: "transform",
        pointerEvents: visible ? "auto" : "none",
      }}
    >
      <div className="flex items-center gap-3 px-3 py-2.5">
        <div className="relative h-12 w-10 flex-shrink-0 overflow-hidden rounded-md bg-black/5">
          <Image
            src={safeImageSrc(product.featuredImage.url)}
            alt={product.featuredImage.altText}
            fill
            sizes="40px"
            placeholder="blur"
            blurDataURL={BLUR_DATA_URL}
            className="object-cover"
          />
        </div>
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="line-clamp-1 text-xs font-medium leading-tight">
            {product.title}
          </span>
          <PriceDisplay price={variant.price} compareAt={variant.compareAtPrice} size="sm" />
        </div>
        <AddToBagButton
          product={product}
          variant={variant}
          quantity={quantity}
          className="w-auto flex-shrink-0 px-4 py-2.5 text-xs"
        />
      </div>
    </div>
  );
}
