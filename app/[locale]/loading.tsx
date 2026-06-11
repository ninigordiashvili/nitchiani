/**
 * Default loading skeleton for locale routes — rendered immediately during navigation
 * while the server resolves the new page. Matches the product-grid layout because most
 * routes (homepage, shop, collections) eventually render product grids; for routes that
 * don't, the placeholder is harmless filler that disappears as soon as the real content
 * streams in.
 *
 * Override per-route by dropping a more specific `loading.tsx` in that segment.
 */
export default function Loading() {
  return (
    <div className="container-shop py-8 sm:py-12">
      <div className="mb-6 h-6 w-40 animate-pulse rounded bg-black/5" />
      <div className="grid grid-cols-2 gap-x-2 gap-y-6 sm:grid-cols-3 sm:gap-x-4 lg:grid-cols-4">
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} className="space-y-2">
            <div className="aspect-[4/5] animate-pulse bg-black/5" />
            <div className="h-3 w-3/4 animate-pulse rounded bg-black/5" />
            <div className="h-3 w-1/3 animate-pulse rounded bg-black/5" />
          </div>
        ))}
      </div>
    </div>
  );
}
