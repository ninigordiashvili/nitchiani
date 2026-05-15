import { Tag } from "lucide-react";
import Image from "next/image";
import { ProductGrid } from "@/components/commerce/ProductGrid";
import type { Campaign } from "@/lib/campaigns";
import { findCoupon, couponLabel } from "@/lib/cart/coupons";
import type { Locale } from "@/lib/i18n/config";
import { BLUR_DATA_URL } from "@/lib/images";
import type { Product } from "@/lib/shopify/types";

/**
 * Renders a campaign landing page: full-bleed hero banner + tagline, optional coupon
 * banner, then a `ProductGrid` of the curated handles.
 *
 * Server component — no client state. The optional coupon is surfaced as a static info
 * banner; users can apply it themselves in the cart / checkout coupon field. Avoids the
 * UX surprise of a silent auto-apply overriding a coupon the user already has.
 */
export function CampaignView({
  campaign,
  products,
  locale,
}: {
  campaign: Campaign;
  products: Product[];
  locale: Locale;
}) {
  const ka = locale === "ka";
  const title = ka ? campaign.titleKa : campaign.titleEn;
  const tagline = ka ? campaign.taglineKa : campaign.taglineEn;
  const eyebrow = ka ? campaign.eyebrowKa : campaign.eyebrowEn;
  const coupon = campaign.couponCode ? findCoupon(campaign.couponCode) : null;

  return (
    <div className="pb-12">
      {/* Hero */}
      <div className="relative h-[280px] w-full overflow-hidden sm:h-[400px]">
        <Image
          src={campaign.bannerImage}
          alt={title}
          fill
          sizes="100vw"
          priority
          placeholder="blur"
          blurDataURL={BLUR_DATA_URL}
          className="object-cover"
        />
        <div className="absolute inset-0 scrim-bottom" />
        <div className="absolute right-0 bottom-0 left-0 text-[var(--color-brand-cream)]">
          <div className="container-shop py-6 sm:py-10">
            {eyebrow ? (
              <p className="label-eyebrow mb-2 text-[var(--color-brand-silver)]">
                {eyebrow}
              </p>
            ) : null}
            <h1 className="font-display text-3xl leading-[1.05] tracking-tight sm:text-5xl">
              {title}
            </h1>
            <p className="mt-3 max-w-md text-sm opacity-85 sm:text-base">
              {tagline}
            </p>
          </div>
        </div>
      </div>

      {/* Optional coupon banner */}
      {coupon ? (
        <div className="container-shop mt-6">
          <div
            className="flex items-center justify-center gap-2 rounded-md px-4 py-2.5 text-xs"
            style={{
              background:
                "color-mix(in oklab, var(--color-brand-maroon) 8%, transparent)",
              color: "var(--color-brand-maroon)",
              border:
                "1px dashed color-mix(in oklab, var(--color-brand-maroon) 40%, transparent)",
            }}
          >
            <Tag size={12} />
            <span className="font-medium tabular-nums tracking-[0.14em]">
              {coupon.code}
            </span>
            <span>·</span>
            <span>{couponLabel(coupon)}</span>
          </div>
        </div>
      ) : null}

      {/* Grid */}
      <section className="container-shop mt-8">
        <ProductGrid products={products} priorityFirst={4} />
      </section>
    </div>
  );
}
