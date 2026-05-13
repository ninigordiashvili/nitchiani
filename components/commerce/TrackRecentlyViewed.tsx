"use client";

import { useEffect } from "react";
import type { Product } from "@/lib/shopify/types";
import { useRecentlyViewed } from "@/lib/recently-viewed/store";

/**
 * No-render side-effect component. Mount on a PDP to record the visit into the
 * recently-viewed store. Re-records on handle changes so client-side route transitions
 * between products are captured too.
 */
export function TrackRecentlyViewed({ product }: { product: Product }) {
  const { add } = useRecentlyViewed();

  useEffect(() => {
    add({
      handle: product.handle,
      title: product.title,
      image: product.featuredImage,
      price: product.variants[0]?.price ?? product.priceRange.min,
    });
  }, [product.handle, product.title, product.featuredImage, product.variants, product.priceRange.min, add]);

  return null;
}
