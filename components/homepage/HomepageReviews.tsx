import { getTopReviews } from "@/lib/reviews";
import { getProducts } from "@/lib/shopify/client";
import type { Locale } from "@/lib/i18n/config";
import { ReviewsRail } from "./ReviewsRail";

/**
 * Server wrapper. Fetches the top reviews then hands off to the client `ReviewsRail` which
 * owns the horizontal scroll + prev/next controls.
 *
 * Split is intentional: the data fetch (sync today, server-side in the future) stays in this
 * server component; the rail needs refs and click handlers, so it has to be client.
 */
export async function HomepageReviews({ locale }: { locale: Locale }) {
  // Reviews are written against product handles, and each card links to its product. Once the
  // catalog is served live those handles may no longer exist — a review for a product the shop
  // doesn't stock is a dead link and, worse, advertises something nobody can buy. So keep only
  // the reviews whose product is actually in the current catalog, whichever backend supplied it.
  const stocked = new Set((await getProducts(locale, 200)).map((p) => p.handle));
  const reviews = getTopReviews(locale, 24).filter((r) => stocked.has(r.productHandle)).slice(0, 6);
  if (reviews.length === 0) return null;
  return <ReviewsRail reviews={reviews} />;
}
