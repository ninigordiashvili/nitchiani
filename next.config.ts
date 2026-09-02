import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./lib/i18n/request.ts");

const isDev = process.env.NODE_ENV === "development";

/**
 * Content-Security-Policy tuned to the storefront's actual dependencies:
 *  - Next App Router injects inline bootstrap scripts → `'unsafe-inline'` for script-src
 *    (we don't use nonces; this is the documented trade-off). Dev also needs `'unsafe-eval'`
 *    + `ws:` for HMR, so those are added only in development.
 *  - Cal.com booking embed loads/iframes/XHRs against `*.cal.com`.
 *  - EchoDesk live chat: script + iframe UI from `echodesk.ge`, config fetch to
 *    `api.echodesk.ge`. It uses no websockets, workers, remote fonts or images, so
 *    those directives stay untouched.
 *  - Images come through next/image (self) plus the remote CDNs in `images.remotePatterns`.
 *  - Fonts are self-hosted by next/font, so `font-src 'self'`.
 *
 * NOTE: when the Meta/TikTok pixels get wired (roast item #5), their origins must be added to
 * script-src + connect-src, or they'll be blocked.
 */
const csp = [
  `default-src 'self'`,
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} https://*.cal.com https://echodesk.ge`,
  `style-src 'self' 'unsafe-inline'`,
  `img-src 'self' data: blob: https://echodesk-media.fsn1.your-objectstorage.com https://cdn.shopify.com https://*.cdninstagram.com https://*.fbcdn.net https://picsum.photos https://fastly.picsum.photos https://*.cal.com`,
  `font-src 'self' data:`,
  // `*.api.echodesk.ge` covers the tenant subdomain (nitchiani.api.echodesk.ge); the bare
  // host alone does not match it, so client-side storefront calls would be blocked.
  `connect-src 'self' https://*.cal.com https://api.echodesk.ge https://*.api.echodesk.ge${isDev ? " ws:" : ""}`,
  `frame-src 'self' https://*.cal.com https://echodesk.ge`,
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
   * The category set was renamed (extensions → hair-extensions, loc-care → braiding-wax, …).
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
      ["loc-care", "braiding-wax"],
      ["accessories", "hair-accessories"],
    ];
    return [
      ...moved.map(([from, to]) => ({
        source: `/:locale(ka|en)/shop/${from}`,
        destination: `/:locale/shop/${to}`,
        permanent: true,
      })),
      ...["piercings", "tools"].map((from) => ({
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
