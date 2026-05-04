import { useTranslations } from "next-intl";
import type { Product } from "@/lib/shopify/types";
import { ProductGrid } from "./ProductGrid";

export function RelatedProducts({ products }: { products: Product[] }) {
  const t = useTranslations("product");
  if (products.length === 0) return null;

  return (
    <section className="container-shop mt-16">
      <h2 className="font-display mb-5 text-2xl tracking-tight sm:text-3xl">
        {t("related")}
      </h2>
      <ProductGrid products={products} />
    </section>
  );
}
