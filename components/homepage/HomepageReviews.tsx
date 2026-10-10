import { getReviews } from "@/lib/echodesk/reviews";
import { getProducts } from "@/lib/shopify/client";
import type { HomepageReview } from "@/lib/reviews";
import type { Locale } from "@/lib/i18n/config";
import { ReviewsRail } from "./ReviewsRail";

/** How many make the rail. More than this and it stops being a highlight. */
const LIMIT = 6;

/**
 * Real customer reviews, from EchoDesk, or nothing at all.
 *
 * Reviews are written against a product, and EchoDesk serves them per product — so rather
 * than asking for all sixteen, this asks only the products whose own record says they have
 * any (`review_count`, which arrives with the catalogue already). Today that is none, and the
 * section renders nothing; the day you approve your first review in EchoDesk it appears here
 * on its own.
 */
export async function HomepageReviews({ locale }: { locale: Locale }) {
  const products = await getProducts(locale, 200);
  const reviewed = products.filter((p) => (p.reviewSummary?.count ?? 0) > 0);
  if (reviewed.length === 0) return null;

  const perProduct = await Promise.all(
    reviewed.map(async (p) => {
      const reviews = await getReviews(p.id).catch(() => null);
      return (reviews ?? []).map((r) => ({ ...r, productHandle: p.handle }));
    }),
  );

  // Best first, then most recent — a highlight reel, not a chronological log.
  const reviews: HomepageReview[] = perProduct
    .flat()
    .sort((a, b) => b.rating - a.rating || (a.date < b.date ? 1 : -1))
    .slice(0, LIMIT);

  if (reviews.length === 0) return null;

  return (
    <section className="container-shop mt-12">
      <ReviewsRail reviews={reviews} />
    </section>
  );
}
