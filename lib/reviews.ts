/**
 * The shape a review takes on screen, and nothing else.
 *
 * This file used to carry eight hand-written testimonials keyed by product handle — sample
 * copy from before the shop had customers. They are gone, and deliberately not replaced:
 * a testimonial nobody wrote is a fabricated review, which Georgian consumer law treats as an
 * unfair commercial practice and which a card acquirer reviewing the site would be right to
 * flag. Reviews now come from EchoDesk and only from EchoDesk — see `lib/echodesk/reviews.ts`
 * — where the merchant enters what a customer actually said and approves it.
 */

export type LocalizedReview = {
  id: string;
  author: string;
  /** EchoDesk doesn't collect one; the card renders it only when present. */
  city: string;
  date: string;
  rating: number;
  body: string;
};

/** A review on the homepage rail knows which product it is about, so the card can link to it. */
export type HomepageReview = LocalizedReview & { productHandle: string };

export const NO_REVIEWS = { count: 0, average: 0 } as const;

export function averageRating(ratings: number[]): number {
  if (ratings.length === 0) return 0;
  return Math.round((ratings.reduce((sum, r) => sum + r, 0) / ratings.length) * 10) / 10;
}
