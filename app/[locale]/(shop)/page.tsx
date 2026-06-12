import type { Metadata } from "next";
import { cookies } from "next/headers";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { CategoryChips } from "@/components/homepage/CategoryChips";
import { SectionHeader } from "@/components/homepage/SectionHeader";
import { CategoryCardGrid } from "@/components/homepage/CategoryCardGrid";
import { HomepageReviews } from "@/components/homepage/HomepageReviews";
import { InstagramStrip } from "@/components/homepage/InstagramStrip";
import { ServicesTeaser } from "@/components/homepage/ServicesTeaser";
import { ProductGrid } from "@/components/commerce/ProductGrid";
import { RecentlyViewedRail } from "@/components/commerce/RecentlyViewedRail";
import { BundleUpsellPicker } from "@/components/homepage/BundleUpsellPicker";
import { UvpBanner } from "@/components/homepage/UvpBanner";
import { BUNDLES, type Bundle } from "@/lib/bundles";
import { getBestSellers, getProductByHandle, getProducts } from "@/lib/shopify/client";
import type { Locale } from "@/lib/i18n/config";
import type { Product } from "@/lib/shopify/types";
import { localeAlternates } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  // `absolute` so the home page keeps the full brand title instead of the "%s · Nitchiani"
  // template; only the canonical/hreflang differ from the site defaults.
  return {
    title: {
      absolute: "Nitchiani — Premium braids, locs & haircare · Tbilisi",
    },
    alternates: localeAlternates(locale, ""),
  };
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [bestSellers, allProducts, t, cookieStore] = await Promise.all([
    getBestSellers(locale, 50),
    getProducts(locale, 50),
    getTranslations("home"),
    cookies(),
  ]);

  // Server-side gate for the one-time UVP banner. When the cookie is set, the banner is
  // never even sent to the client — no SSR flash, no layout shift, no client-side hide.
  // The cookie is written client-side by `UvpBanner` once the visitor scrolls past it.
  const showUvpBanner = cookieStore.get("uvp-seen")?.value !== "1";

  // "All Products" rail — best sellers first (in their curated order), then everything else
  // in catalog order. Dedup by handle so a product showing up in both lists doesn't repeat.
  const seenHandles = new Set<string>();
  const orderedProducts = [
    ...bestSellers.filter((p) => (seenHandles.has(p.handle) ? false : (seenHandles.add(p.handle), true))),
    ...allProducts.filter((p) => (seenHandles.has(p.handle) ? false : (seenHandles.add(p.handle), true))),
  ];

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
      {/* 1 — Brand UVP banner. One-time-only — only renders for visitors who haven't yet
          scrolled past it (gated by the `uvp-seen` cookie). Dismisses itself on first
          scroll and writes the cookie so subsequent visits skip it entirely. */}
      {showUvpBanner ? <UvpBanner /> : null}

      {/* 2 — Category chips */}
      <CategoryChips />

      {/* 3 — Recently viewed (renders only when the user has visited PDPs before) */}
      <section className="container-shop mt-4">
        <RecentlyViewedRail />
      </section>

      {/* 3 — All Products (best sellers first, then the rest) */}
      <section className="container-shop mt-4">
        <SectionHeader
          title={t("allProducts")}
          eyebrow={t("shopByCategory")}
          href="/shop"
        />
        <ProductGrid products={orderedProducts.slice(0, 8)} priorityFirst={4} />
      </section>

      {/* 4 — Featured bundle (picked client-side to match recent browsing) */}
      {bundlesWithProducts.length > 0 ? (
        <section className="container-shop mt-12">
          <BundleUpsellPicker bundlesWithProducts={bundlesWithProducts} />
        </section>
      ) : null}

      {/* 5 — Booking + services (full-bleed dark panel, content inside container) */}
      <section className="mt-12">
        <ServicesTeaser />
      </section>

      {/* 7 — Visual category cards */}
      <section className="container-shop mt-12">
        <SectionHeader title={t("shopByCategory")} />
        <CategoryCardGrid />
      </section>

      {/* 8 — Customer testimonials */}
      <section className="container-shop mt-12">
        <HomepageReviews locale={locale} />
      </section>

      {/* 9 — Instagram strip (closes the page on a social-feed note) */}
      <section className="container-shop mt-8 sm:mt-12">
        <InstagramStrip />
      </section>
    </div>
  );
}
