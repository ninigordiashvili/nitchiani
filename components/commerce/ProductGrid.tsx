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
