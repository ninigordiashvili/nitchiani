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
 * Everything else — local files, Instagram, placeholders — still goes through `/_next/image`
 * exactly as the built-in loader would send it.
 */
const DIRECT_HOSTS = ["echodesk-media.fsn1.your-objectstorage.com"];

export default function imageLoader({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}): string {
  try {
    if (DIRECT_HOSTS.includes(new URL(src).hostname)) return src;
  } catch {
    // A relative path such as /categories/x.jpg — not a URL, so not a direct host.
  }
  return `/_next/image?url=${encodeURIComponent(src)}&w=${width}&q=${quality || 75}`;
}
