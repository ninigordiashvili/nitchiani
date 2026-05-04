/**
 * Returns a safe image URL for components that render `next/image` from data sources we don't fully
 * control (e.g. localStorage cart lines, third-party APIs). If the URL host isn't in the
 * `next.config.ts` remotePatterns allow-list, falls back to a local placeholder so the component
 * doesn't throw an unconfigured-host runtime error.
 */
const ALLOWED_HOSTS = [
  "cdn.shopify.com",
  "picsum.photos",
  "fastly.picsum.photos",
  "scontent.cdninstagram.com",
];
const ALLOWED_HOST_SUFFIXES = ["cdninstagram.com", "fbcdn.net"];

const FALLBACK = "/products/gold-wax.png";

export function safeImageSrc(src: string | undefined | null): string {
  if (!src) return FALLBACK;
  if (src.startsWith("/")) return src;
  try {
    const { hostname } = new URL(src);
    if (ALLOWED_HOSTS.includes(hostname)) return src;
    if (ALLOWED_HOST_SUFFIXES.some((suffix) => hostname.endsWith(suffix))) return src;
  } catch {
    // malformed URL → fall through
  }
  return FALLBACK;
}
