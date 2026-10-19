"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { PriceDisplay } from "@/components/commerce/PriceDisplay";
import { Link } from "@/lib/i18n/routing";
import { BLUR_DATA_URL, safeImageSrc } from "@/lib/images";
import { type RecentlyViewedItem, useRecentlyViewed } from "@/lib/recently-viewed/store";

/**
 * Horizontal scroll rail of the user's recently viewed products. Hides itself when there
 * aren't enough items to feel like a legitimate "recall" surface.
 *
 * `minItems` defaults to 3 — a single-card or two-card rail reads as a glitchy duplicate
 * of the product the user just looked at, especially on the PDP where the *current*
 * product is excluded. Three items signals "you've actually browsed". Override per call
 * (e.g. empty-cart fallback might want a lower threshold).
 *
 * `excludeHandle` suppresses the product currently being viewed on the PDP; the homepage
 * leaves it undefined.
 */
export function RecentlyViewedRail({
  excludeHandle,
  minItems = 3,
  fallback,
}: {
  excludeHandle?: string;
  minItems?: number;
  /**
   * What the slot shows instead of a browsing history: products rendered on the server, so
   * the section is in the HTML from the first paint.
   *
   * Without it this rail appears only once the browser has read localStorage, inserting a
   * whole row into an already-painted page and pushing everything below it down. With it the
   * slot is the same height either way — only the products and the heading change.
   */
  fallback?: RecentlyViewedItem[];
} = {}) {
  const t = useTranslations("home");
  const { items } = useRecentlyViewed();

  const visible = excludeHandle
    ? items.filter((i) => i.handle !== excludeHandle)
    : items;

  // `items` is empty on the first client render too — the store reads storage in an effect —
  // so this starts on the fallback and matches what the server sent.
  const showRecent = visible.length >= minItems;
  const shown = showRecent ? visible : (fallback ?? []);

  if (shown.length === 0) return null;

  return (
    <section>
      <p className="label-eyebrow mb-3">{showRecent ? t("recentlyViewed") : t("popularNow")}</p>
      <ul className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        {shown.map((item) => (
          <li
            key={item.handle}
            className="w-[140px] flex-shrink-0 snap-start"
          >
            <Link href={`/products/${item.handle}`} className="group block">
              <div className="relative aspect-square overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border-card)] bg-white transition-[box-shadow,border-color] duration-300 ease-[var(--ease-brand)] group-hover:border-[var(--border-card-hover)] group-hover:shadow-[0_8px_28px_-10px_color-mix(in_oklab,var(--color-brand-maroon)_38%,transparent)]">
                <Image
                  src={safeImageSrc(item.image.url)}
                  alt={item.image.altText}
                  fill
                  sizes="140px"
                  // The rail scrolls sideways, so every thumbnail sits at the same height as
                  // the first and `loading="lazy"` defers none of them — the browser fetches
                  // all eight at once, immediately above the product grid whose first photo
                  // is the LCP element. Low priority keeps the recall strip behind the thing
                  // the page is actually judged on; at ~9 KB each they still arrive promptly.
                  fetchPriority="low"
                  placeholder="blur"
                  blurDataURL={BLUR_DATA_URL}
                  className="object-contain transition-transform duration-500 ease-[var(--ease-brand)] group-hover:scale-[1.025]"
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
