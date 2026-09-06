/**
 * Returns a safe image URL for components that render `next/image` from data sources we don't fully
 * control (e.g. localStorage cart lines, third-party APIs). If the URL host isn't in the
 * `next.config.ts` remotePatterns allow-list, falls back to a local placeholder so the component
 * doesn't throw an unconfigured-host runtime error.
 */
const ALLOWED_HOSTS = [
  "echodesk-media.fsn1.your-objectstorage.com",
  "cdn.shopify.com",
  "picsum.photos",
  "fastly.picsum.photos",
  "scontent.cdninstagram.com",
];
const ALLOWED_HOST_SUFFIXES = ["cdninstagram.com", "fbcdn.net"];

const FALLBACK = "/products/gold-wax.png";

/**
 * Tiny cream-toned SVG used as `blurDataURL` for every `<Image>` on the site. Solid
 * `--color-brand-cream-2` so the placeholder blends into the surface rather than flashing
 * a generic grey. Next/Image applies a CSS blur on top, so even a flat fill reads as soft.
 *
 * SVG → base64: `<svg viewBox="0 0 6 4"><rect ... fill="#ece4d6"/></svg>`.
 */
export const BLUR_DATA_URL =
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA2IDQiPjxyZWN0IHdpZHRoPSI2IiBoZWlnaHQ9IjQiIGZpbGw9IiNlY2U0ZDYiLz48L3N2Zz4=";

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

/**
 * Drops repeated shots from a gallery, keeping first appearance order.
 *
 * Placeholder galleries pad themselves by repeating one photo, which is tolerable on the PDP
 * where the rail is small and off to the side, but in a compact surface a row of identical
 * thumbnails reads as a rendering bug rather than "more angles available". Callers that only
 * want to offer a picker when it carries real information gate on this length being > 1, so
 * the control stays hidden until genuinely distinct photos exist and appears on its own once
 * they do.
 */
export function distinctImages<T extends { url: string }>(images: T[]): T[] {
  const seen = new Set<string>();
  return images.filter((img) => (seen.has(img.url) ? false : (seen.add(img.url), true)));
}
