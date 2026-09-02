import type { LocalizedReview } from "../reviews";
import { parseEchoDeskGid } from "./adapt";

/**
 * Product reviews from EchoDesk — `GET /api/ecommerce/client/products/{id}/reviews/`.
 *
 * Readable unauthenticated, which is what lets a guest storefront show them. Writing needs a
 * logged-in customer, so reviews are authored in the CRM rather than here — the storefront
 * only ever displays them.
 *
 * Note the endpoint keys on the numeric product id, not the slug, so callers pass the
 * `Product.id` gid and this unwraps it.
 */
const API_URL = process.env.NEXT_PUBLIC_ECHODESK_API_URL?.replace(/\/+$/, "");

type EchoDeskReview = {
  id: number;
  client_name?: string;
  rating?: number;
  title?: string;
  content?: string;
  is_verified_purchase?: boolean;
  created_at?: string;
};

/** Cached briefly: reviews change rarely, and a PDP shouldn't pay for a round trip per view. */
const REVALIDATE = 300;

export async function getReviews(productGid: string): Promise<LocalizedReview[] | null> {
  if (!API_URL) return null;
  const ref = parseEchoDeskGid(productGid);
  if (!ref) return null;

  const res = await fetch(
    `${API_URL}/api/ecommerce/client/products/${ref.id}/reviews/`,
    { headers: { Accept: "application/json" }, next: { revalidate: REVALIDATE } },
  ).catch(() => null);

  if (!res || !res.ok) {
    console.error("[echodesk/reviews] fetch failed:", res?.status);
    return null;
  }

  const json = (await res.json().catch(() => null)) as {
    results?: EchoDeskReview[];
  } | null;
  if (!json?.results) return null;

  return json.results
    // A review with no words is a bare star click; the rail renders quotes, so it has nothing
    // to show. The rating still counts, because that comes from the product's own average.
    .filter((r) => (r.content ?? "").trim().length > 0)
    .map((r) => ({
      id: String(r.id),
      author: r.client_name?.trim() || "—",
      // EchoDesk doesn't collect a city. The field is part of the display shape, so it's
      // blanked rather than invented — the card renders it only when present.
      city: "",
      date: r.created_at ?? "",
      rating: typeof r.rating === "number" ? r.rating : 0,
      body: (r.content ?? "").trim(),
    }));
}
