import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./lib/i18n/request.ts");

const isDev = process.env.NODE_ENV === "development";

/**
 * Content-Security-Policy tuned to the storefront's actual dependencies:
 *  - Next App Router injects inline bootstrap scripts → `'unsafe-inline'` for script-src
 *    (we don't use nonces; this is the documented trade-off). Dev also needs `'unsafe-eval'`
 *    + `ws:` for HMR, so those are added only in development.
 *  - EchoDesk live chat: script + iframe UI from `echodesk.ge`, config fetch to
 *    `api.echodesk.ge`. It uses no websockets, workers, remote fonts or images, so
 *    those directives stay untouched.
 *  - Google Maps (checkout address picker): script from `maps.googleapis.com`, map tiles and
 *    control sprites from `maps.gstatic.com`/`*.googleapis.com`/`*.ggpht.com`, Places and
 *    Geocoding XHRs to `maps.googleapis.com`, Places (New) autocomplete RPCs to the separate
 *    `places.googleapis.com` host, and its injected control stylesheet/fonts from
 *    `fonts.googleapis.com`/`fonts.gstatic.com`. Without a key none of this loads at all.
 *  - Courier logos in the checkout shipping list are served by QuickShipper's own CDN
 *    (`static.quickshipper.app`, and `test-static…` in sandbox). Without these the list
 *    renders a row of broken-image icons next to real prices, which reads as a broken shop.
 *  - Images come through next/image (self) plus the remote CDNs in `images.remotePatterns`.
 *  - Fonts are self-hosted by next/font, so `font-src 'self'`.
 *
 * NOTE: when the Meta/TikTok pixels get wired (roast item #5), their origins must be added to
 * script-src + connect-src, or they'll be blocked.
 */
const csp = [
  `default-src 'self'`,
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} https://echodesk.ge https://maps.googleapis.com https://www.googletagmanager.com`,
  // The Maps JS API injects its own stylesheet link for map controls.
  `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`,
  `img-src 'self' data: blob: https://echodesk-media.fsn1.your-objectstorage.com https://cdn.shopify.com https://*.cdninstagram.com https://*.fbcdn.net https://picsum.photos https://fastly.picsum.photos https://maps.gstatic.com https://maps.googleapis.com https://*.googleapis.com https://*.ggpht.com https://static.quickshipper.app https://test-static.quickshipper.app https://www.google-analytics.com`,
  `font-src 'self' data: https://fonts.gstatic.com`,
  // `*.api.echodesk.ge` covers the tenant subdomain (nitchiani.api.echodesk.ge); the bare
  // host alone does not match it, so client-side storefront calls would be blocked.
  `connect-src 'self' https://api.echodesk.ge https://*.api.echodesk.ge https://maps.googleapis.com https://places.googleapis.com https://www.google-analytics.com https://*.google-analytics.com https://*.analytics.google.com https://www.googletagmanager.com${isDev ? " ws:" : ""}`,
  `frame-src 'self' https://echodesk.ge`,
  `frame-ancestors 'self'`,
  `base-uri 'self'`,
  `form-action 'self'`,
  `object-src 'none'`,
  `upgrade-insecure-requests`,
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  // 2 years, include subdomains, eligible for browser preload lists.
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Lock down powerful APIs the storefront never uses.
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
];

const nextConfig: NextConfig = {
  images: {
    /**
     * Both of these are honoured by `next start` and ignored in production, because Netlify
     * serves `/_next/image` from its own Image CDN rather than through Next's optimizer.
     * Measured against the deployed site (2026-10-15), so nobody re-litigates it from the
     * config alone:
     *
     *   - `formats` has no effect. Netlify negotiates the format itself and answers WebP
     *     even when the request's `Accept` header offers AVIF. That is the better answer
     *     here anyway: asking its Image CDN for AVIF explicitly (`fm=avif`) produced *larger*
     *     files than its WebP at the same quality — 25.2 KB vs 18.2 KB for a 384w product
     *     photo, 34.4 KB vs 22.2 KB for a 640w category cover. Forcing AVIF through a custom
     *     loader would cost bytes, not save them.
     *   - `minimumCacheTTL` is overridden: Netlify returns `max-age=86400`. The year is
     *     reinstated at the edge in `netlify.toml`, which is where it actually takes effect.
     *
     * Both are kept so the local production build and any non-Netlify host still get the
     * intended behaviour.
     */
    formats: ["image/avif", "image/webp"],
    /**
     * Next's defaults with 192 and 448 added. These are the candidate widths offered for the
     * fixed-pixel slots — the rail thumbnails, the gallery and cart thumbs — and the default
     * list jumps straight from 384 to 640, which is a cliff for anything a phone triples.
     *
     * The recently-viewed rail is the expensive case: a 140px slot on a DPR-3 phone asks for
     * 420px, found nothing between 384 and 640, and took the 640w transform — 45.3 KB for a
     * 140px thumbnail, eight of them directly above the product grid. At 448w the same
     * thumbnail is 24.2 KB, so the strip costs 194 KB instead of 362 KB on an iPhone 12-15.
     * 192 does the same job for the 48-64px thumbs, which were also reaching for 256w.
     *
     * Both stay below the smallest `deviceSizes` entry, as Next requires. A finer candidate
     * can only ever reduce the overshoot, so no slot gets a larger image than it did before.
     */
    imageSizes: [16, 32, 48, 64, 96, 128, 192, 256, 384, 448],
    // A generated image URL names its source, width and quality, and EchoDesk's media
    // filenames carry their own timestamp — so the same URL always means the same bytes.
    minimumCacheTTL: 31536000,
    remotePatterns: [
      { protocol: "https", hostname: "cdn.shopify.com" },
      // EchoDesk product media (object storage behind their CMS).
      { protocol: "https", hostname: "echodesk-media.fsn1.your-objectstorage.com" },
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "fastly.picsum.photos" },
      { protocol: "https", hostname: "scontent.cdninstagram.com" },
      { protocol: "https", hostname: "scontent-*.cdninstagram.com" },
      { protocol: "https", hostname: "instagram.f*.fbcdn.net" },
    ],
  },
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
  /**
   * The category set was renamed (extensions → hair-extensions, loc-care → hair-care, …).
   * These URLs were in the sitemap and are linked from the journal, so a plain 404 would throw
   * away whatever ranking and bookmarks they'd earned. Permanent redirects to the closest
   * equivalent; the two categories with no successor land on the shop index rather than
   * pretending to be something they aren't.
   *
   * `:locale` keeps the visitor in the language they arrived in.
   */
  async redirects() {
    const moved: Array<[string, string]> = [
      ["extensions", "hair-extensions"],
      ["loc-care", "hair-care"],
      ["accessories", "hair-accessories"],
    ];
    return [
      // The salon-era sections are gone; send old links home rather than to a 404.
      ...["services", "journal"].flatMap((from) => [
        { source: `/:locale(ka|en)/${from}`, destination: "/:locale", permanent: true },
        { source: `/:locale(ka|en)/${from}/:slug*`, destination: "/:locale", permanent: true },
      ]),
      ...moved.map(([from, to]) => ({
        source: `/:locale(ka|en)/shop/${from}`,
        destination: `/:locale/shop/${to}`,
        permanent: true,
      })),
      // Best Sellers and New Arrivals were removed outright — every product was flagged featured, so the
      // collection had become the catalog under another name. It was in the sitemap, so it
      // redirects rather than 404s.
      ...["piercings", "tools", "best-sellers", "new-arrivals"].map((from) => ({
        source: `/:locale(ka|en)/shop/${from}`,
        destination: `/:locale/shop`,
        permanent: true,
      })),
    ];
  },

  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default withNextIntl(nextConfig);
