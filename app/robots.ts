import type { MetadataRoute } from "next";

/**
 * Robots policy. Allow public catalog crawling; disallow the internal endpoints (api, auth).
 *
 * The personal surfaces — cart, checkout, wishlist — are deliberately NOT listed here, even
 * though they must never be indexed. They each send `noindex, follow` in their metadata, and
 * a `Disallow` would cancel that rather than reinforce it: a crawler that is not allowed to
 * fetch the URL never reads the `noindex` on it, so the URL can still be indexed bare — title
 * and no snippet — on the strength of a link alone. Google is explicit that `noindex` only
 * takes effect on a page it is permitted to crawl.
 *
 * So the rule is: if a page carries `noindex`, let crawlers in to read it. `Disallow` is for
 * what has no page to put a tag on — `/api/`, `/auth/` — where it is the only lever there is.
 */
export default function robots(): MetadataRoute.Robots {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
    "http://localhost:3000";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/auth/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
