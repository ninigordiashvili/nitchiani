"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { PriceDisplay } from "@/components/commerce/PriceDisplay";
import { Link } from "@/lib/i18n/routing";
import { BLUR_DATA_URL, safeImageSrc } from "@/lib/images";
import { useRecentlyViewed } from "@/lib/recently-viewed/store";

/**
 * Horizontal scroll rail of the user's recently viewed products. Hides itself when there's
 * nothing to show — first-time visitors never see an empty rail.
 *
 * `excludeHandle` lets the PDP suppress the product currently being viewed; on the homepage
 * just leave it undefined.
 */
export function RecentlyViewedRail({ excludeHandle }: { excludeHandle?: string } = {}) {
  const t = useTranslations("home");
  const { items } = useRecentlyViewed();

  const visible = excludeHandle
    ? items.filter((i) => i.handle !== excludeHandle)
    : items;

  if (visible.length === 0) return null;

  return (
    <section>
      <p className="label-eyebrow mb-3">{t("recentlyViewed")}</p>
      <ul className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        {visible.map((item) => (
          <li
            key={item.handle}
            className="w-[140px] flex-shrink-0 snap-start"
          >
            <Link href={`/products/${item.handle}`} className="group block">
              <div className="relative aspect-square overflow-hidden bg-black/5">
                <Image
                  src={safeImageSrc(item.image.url)}
                  alt={item.image.altText}
                  fill
                  sizes="140px"
                  placeholder="blur"
                  blurDataURL={BLUR_DATA_URL}
                  className="object-cover transition-transform duration-500 ease-[var(--ease-brand)] group-hover:scale-105"
                />
              </div>
              <p className="mt-2 line-clamp-1 text-xs leading-tight">{item.title}</p>
              <div className="mt-1">
                <PriceDisplay price={item.price} size="sm" />
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
