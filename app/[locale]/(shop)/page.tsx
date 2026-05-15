import { setRequestLocale, getTranslations } from "next-intl/server";
import { CategoryChips } from "@/components/homepage/CategoryChips";
import { SectionHeader } from "@/components/homepage/SectionHeader";
import { EditorialBanner } from "@/components/homepage/EditorialBanner";
import { CategoryCardGrid } from "@/components/homepage/CategoryCardGrid";
import { HomepageReviews } from "@/components/homepage/HomepageReviews";
import { InstagramStrip } from "@/components/homepage/InstagramStrip";
import { ServicesTeaser } from "@/components/homepage/ServicesTeaser";
import { ProductGrid } from "@/components/commerce/ProductGrid";
import { RecentlyViewedRail } from "@/components/commerce/RecentlyViewedRail";
import { BundleUpsellPicker } from "@/components/homepage/BundleUpsellPicker";
import { BUNDLES, type Bundle } from "@/lib/bundles";
import { getBestSellers, getNewArrivals, getProductByHandle } from "@/lib/shopify/client";
import type { Locale } from "@/lib/i18n/config";
import type { Product } from "@/lib/shopify/types";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [bestSellers, newArrivals, t] = await Promise.all([
    getBestSellers(locale, 8),
    getNewArrivals(locale, 8),
    getTranslations("home"),
  ]);

  // Pre-fetch every candidate bundle's products in parallel server-side. The client picker
  // then selects the best fit from these based on the user's recently-viewed history,
  // without any extra round-trips. Bundles whose products are all unresolved drop out.
  const allBundleHandles = Array.from(
    new Set(BUNDLES.flatMap((b) => b.handles)),
  );
  const fetchedProducts = await Promise.all(
    allBundleHandles.map((h) => getProductByHandle(h, locale)),
  );
  const productByHandle = new Map<string, Product>();
  allBundleHandles.forEach((h, i) => {
    const p = fetchedProducts[i];
    if (p) productByHandle.set(h, p);
  });
  const bundlesWithProducts: { bundle: Bundle; products: Product[] }[] = BUNDLES
    .map((bundle) => ({
      bundle,
      products: bundle.handles
        .map((h) => productByHandle.get(h))
        .filter((p): p is Product => Boolean(p)),
    }))
    .filter((bp) => bp.products.length === bp.bundle.handles.length);

  return (
    <div className="pb-0 sm:pb-12">
      {/* 1 — Category chips */}
      <CategoryChips />

      {/* 1.5 — Recently viewed (renders only when the user has visited PDPs before) */}
      <section className="container-shop mt-4">
        <RecentlyViewedRail />
      </section>

      {/* 2 — Best sellers */}
      <section className="container-shop mt-4">
        <SectionHeader
          title={t("bestSellers")}
          eyebrow={t("shopByCategory")}
          href="/shop/best-sellers"
        />
        <ProductGrid products={bestSellers} priorityFirst={4} />
      </section>

      {/* 2.5 — Featured bundle (picked client-side to match recent browsing) */}
      {bundlesWithProducts.length > 0 ? (
        <section className="container-shop mt-12">
          <BundleUpsellPicker bundlesWithProducts={bundlesWithProducts} />
        </section>
      ) : null}

      {/* 3 — Editorial banner #1 (full-bleed image, text inside container) */}
      <section className="mt-12">
        <EditorialBanner
          imageUrl="/banners/new-drop.png"
          imageAlt="New drop"
          eyebrow={t("newDrop")}
          title={t("newDrop")}
          subtitle={t("newDropSubtitle")}
          ctaLabel={t("shopNow")}
          href="/shop/new-arrivals"
        />
      </section>

      {/* 4 — New arrivals */}
      <section className="container-shop mt-12">
        <SectionHeader title={t("newArrivals")} href="/shop/new-arrivals" />
        <ProductGrid products={newArrivals} />
      </section>

      {/* 5 — Customer testimonials */}
      <section className="container-shop mt-12">
        <HomepageReviews locale={locale} />
      </section>

      {/* 6 — Visual category cards */}
      <section className="container-shop mt-12">
        <SectionHeader title={t("shopByCategory")} />
        <CategoryCardGrid />
      </section>

      {/* 6 — Booking + services merged (full-bleed dark panel, content inside container) */}
      <section className="mt-12">
        <ServicesTeaser />
      </section>

      {/* 7 — Instagram strip (last homepage section — trust signals now live in the footer) */}
      <section className="container-shop mt-8 sm:mt-12">
        <InstagramStrip />
      </section>
    </div>
  );
}
