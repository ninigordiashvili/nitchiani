import { getTopReviews } from "@/lib/reviews";
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
  const reviews = getTopReviews(locale, 6);
  if (reviews.length === 0) return null;
  return <ReviewsRail reviews={reviews} />;
}
