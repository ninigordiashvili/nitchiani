/**
 * Image loader for next/image.
 *
 * EchoDesk product photos are loaded straight from their storage, not through Netlify's Image
 * CDN. Measured on the live site (2026-11-04): a 640w transform took 1.4-1.7 s on every
 * request, repeats included (`cache-status: Netlify Edge; fwd=miss`), while the same photo
 * downloaded directly from storage took 0.6-0.75 s at its full 335 KB. The photos are now
 * uploaded pre-sized (about 800x1000, ~100-150 KB), so nothing is gained by re-encoding them,
 * and the transform step was the slow part.
 *
 * Files in /public still get resized (on Netlify) because the category covers are 270-380 KB;
 * see the branches below.
 */
/**
 * Set at build time by next.config.ts when building on Netlify. A custom loader switches
 * Next's own `/_next/image` endpoint off, so locally (dev, `next start`) there is nothing to
 * resize with and files are served as they are.
 */
const ON_NETLIFY = process.env.NEXT_PUBLIC_IMAGE_CDN === "netlify";

export default function imageLoader({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}): string {
  // A file in /public (the category covers, the logo): resized by Netlify's Image CDN when
  // there is one, otherwise served as it is. Absolute URLs are never rewritten.
  if (src.startsWith("/")) {
    return ON_NETLIFY
      ? `/.netlify/images?url=${encodeURIComponent(src)}&w=${width}&q=${quality || 75}`
      : src;
  }
  // EchoDesk photos, and anything else on another host (Instagram, placeholders): straight
  // from the source.
  return src;
}
