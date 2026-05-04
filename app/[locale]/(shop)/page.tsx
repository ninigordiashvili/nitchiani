import { setRequestLocale, getTranslations } from "next-intl/server";
import { CategoryChips } from "@/components/homepage/CategoryChips";
import { SectionHeader } from "@/components/homepage/SectionHeader";
import { EditorialBanner } from "@/components/homepage/EditorialBanner";
import { CategoryCardGrid } from "@/components/homepage/CategoryCardGrid";
import { InstagramStrip } from "@/components/homepage/InstagramStrip";
import { ServicesTeaser } from "@/components/homepage/ServicesTeaser";
import { ProductGrid } from "@/components/commerce/ProductGrid";
import { getBestSellers, getNewArrivals } from "@/lib/shopify/client";
import type { Locale } from "@/lib/i18n/config";

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

  return (
    <div className="pb-12">
      {/* 1 — Category chips */}
      <CategoryChips />

      {/* 2 — Best sellers */}
      <section className="container-shop mt-4">
        <SectionHeader
          title={t("bestSellers")}
          eyebrow={t("shopByCategory")}
          href="/shop/best-sellers"
        />
        <ProductGrid products={bestSellers} priorityFirst={4} />
      </section>

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

      {/* 5 — Visual category cards */}
      <section className="container-shop mt-12">
        <SectionHeader title={t("shopByCategory")} />
        <CategoryCardGrid />
      </section>

      {/* 6 — Booking + services merged (full-bleed dark panel, content inside container) */}
      <section className="mt-12">
        <ServicesTeaser />
      </section>

      {/* 7 — Instagram strip (last homepage section — trust signals now live in the footer) */}
      <section className="container-shop mt-12">
        <InstagramStrip />
      </section>
    </div>
  );
}
