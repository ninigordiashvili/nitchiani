import type { Product } from "@/lib/shopify/types";
import { ProductCard } from "./ProductCard";
import { cn } from "@/lib/utils";

export function ProductGrid({
  products,
  className,
  priorityFirst = 0,
}: {
  products: Product[];
  className?: string;
  /**
   * How many leading cards are preloaded at high priority. Count the phone's first row, not
   * the desktop one — this grid is two columns on a phone and four on a desktop, and the
   * number that matters is how many photos are allowed to bid for bandwidth before the
   * largest one above the fold has arrived.
   *
   * The remaining cards of a desktop first row stay lazy on purpose. A lazy image that is
   * already inside the viewport is still fetched on load, just behind the preloaded ones, so
   * the row fills without waiting for a scroll. Trying to say that explicitly with
   * `loading="eager"` does not work: next/image emits a `<link rel="preload">` for an eager
   * image exactly as it does for a priority one (measured against next 15.5.15 — four eager
   * cards produced four preloads), which is the thing being avoided here.
   */
  priorityFirst?: number;
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-x-2 gap-y-6 sm:grid-cols-3 sm:gap-x-4 lg:grid-cols-4",
        className,
      )}
    >
      {products.map((p, i) => (
        <ProductCard key={p.id} product={p} priority={i < priorityFirst} />
      ))}
    </div>
  );
}
