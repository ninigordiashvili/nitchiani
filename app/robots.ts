import type { MetadataRoute } from "next";

/**
 * Robots policy. Allow public catalog crawling, disallow user-specific surfaces (cart,
 * checkout, wishlist) and internal endpoints (api, auth). The `/<locale>/...` wildcards
 * account for locale-prefixed routes — `/ka/cart`, `/en/cart`, etc.
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
        disallow: [
          "/api/",
          "/auth/",
          "/*/cart",
          "/*/checkout",
          "/*/checkout/*",
          "/*/wishlist",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
