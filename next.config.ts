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
  `img-src 'self' data: blob: https://cdn.shopify.com https://*.cdninstagram.com https://*.fbcdn.net https://picsum.photos https://fastly.picsum.photos https://*.cal.com`,
  `font-src 'self' data:`,
  `connect-src 'self' https://*.cal.com https://api.echodesk.ge${isDev ? " ws:" : ""}`,
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
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default withNextIntl(nextConfig);
