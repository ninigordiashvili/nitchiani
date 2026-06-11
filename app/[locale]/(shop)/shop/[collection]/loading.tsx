/**
 * Collection-shaped skeleton — fired by Next during the server resolution of a
 * `/shop/<slug>` route. Mirrors the real collection page's chips → title → toolbar → grid
 * stack so navigating between collections feels like a content swap, not a layout shift.
 *
 * Campaign landing pages (`/shop/<campaign-slug>`) share the same route segment but have
 * a hero banner instead of category chips. The skeleton stays on the collection shape
 * because most `/shop/<slug>` traffic resolves to collections — campaign landings load
 * fast enough that they typically skip the skeleton anyway.
 */
export default function CollectionLoading() {
  return (
    <div className="pb-12">
      {/* Category chips strip placeholder */}
      <div className="container-shop flex items-center gap-2 overflow-x-auto py-3">
        {Array.from({ length: 6 }, (_, i) => (
          <div
            key={i}
            className="h-8 w-24 flex-shrink-0 animate-pulse rounded-full bg-black/5"
          />
        ))}
      </div>

      <section className="container-shop mt-4">
        {/* Header */}
        <header className="mb-6 space-y-3">
          <div className="h-10 w-48 animate-pulse rounded bg-black/5" />
          <div className="h-4 w-2/3 max-w-prose animate-pulse rounded bg-black/5" />
        </header>

        {/* Toolbar placeholder (filters + sort) */}
        <div className="mb-6 flex flex-col gap-4 border-b border-black/10 pb-4">
          <div className="flex items-center justify-between gap-3">
            <div className="h-3 w-24 animate-pulse rounded bg-black/5" />
            <div className="h-7 w-32 animate-pulse rounded-md bg-black/5" />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {Array.from({ length: 4 }, (_, i) => (
              <div
                key={i}
                className="h-7 w-20 animate-pulse rounded-full bg-black/5"
              />
            ))}
          </div>
        </div>

        {/* Product grid */}
        <div className="grid grid-cols-2 gap-x-2 gap-y-6 sm:grid-cols-3 sm:gap-x-4 lg:grid-cols-4">
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i} className="space-y-2">
              <div className="aspect-[4/5] animate-pulse bg-black/5" />
              <div className="h-3 w-3/4 animate-pulse rounded bg-black/5" />
              <div className="h-3 w-1/3 animate-pulse rounded bg-black/5" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
