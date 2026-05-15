/**
 * PDP-shaped skeleton — fired by Next during the server resolution of a `/products/<handle>`
 * route. Mirrors the real PDP's 2-column layout (gallery + details) so the transition into
 * the rendered page is a content swap rather than a layout shift.
 *
 * No animations beyond the standard `animate-pulse` — the real PDP has its own hover and
 * fade-in choreography; an over-decorated skeleton would clash.
 */
export default function ProductLoading() {
  return (
    <article className="pb-12">
      <div className="container-shop pt-4 sm:grid sm:grid-cols-2 sm:gap-10 sm:pt-8">
        {/* Gallery placeholder — matches the real ProductGallery's main image aspect. */}
        <div className="aspect-[4/5] w-full animate-pulse bg-black/5" />

        {/* Details column */}
        <div className="mt-6 sm:mt-0">
          {/* Breadcrumb row */}
          <div className="mb-3 flex items-center gap-2">
            <div className="h-3 w-12 animate-pulse rounded bg-black/5" />
            <div className="h-3 w-3 animate-pulse rounded bg-black/5" />
            <div className="h-3 w-16 animate-pulse rounded bg-black/5" />
            <div className="h-3 w-3 animate-pulse rounded bg-black/5" />
            <div className="h-3 w-32 animate-pulse rounded bg-black/5" />
          </div>

          {/* Title (2 lines) */}
          <div className="space-y-2">
            <div className="h-8 w-3/4 animate-pulse rounded bg-black/5" />
            <div className="h-8 w-1/2 animate-pulse rounded bg-black/5" />
          </div>

          {/* Rating · share row */}
          <div className="mt-3 flex items-center justify-between">
            <div className="h-4 w-32 animate-pulse rounded bg-black/5" />
            <div className="h-4 w-14 animate-pulse rounded bg-black/5" />
          </div>

          {/* Price */}
          <div className="mt-5 h-8 w-24 animate-pulse rounded bg-black/5" />

          {/* Variant picker */}
          <div className="mt-5 space-y-2">
            <div className="h-3 w-16 animate-pulse rounded bg-black/5" />
            <div className="flex gap-2">
              <div className="h-9 w-14 animate-pulse rounded bg-black/5" />
              <div className="h-9 w-14 animate-pulse rounded bg-black/5" />
              <div className="h-9 w-14 animate-pulse rounded bg-black/5" />
            </div>
          </div>

          {/* Qty stepper + Add to bag row */}
          <div className="mt-5 flex gap-3">
            <div className="h-12 w-28 animate-pulse rounded-md bg-black/5" />
            <div className="h-12 flex-1 animate-pulse rounded-md bg-black/5" />
          </div>

          {/* Ships microcopy */}
          <div className="mx-auto mt-3 h-3 w-56 animate-pulse rounded bg-black/5" />

          {/* Description label + body */}
          <div className="mt-8 space-y-2 border-t border-black/10 pt-6">
            <div className="h-3 w-20 animate-pulse rounded bg-black/5" />
            <div className="space-y-2">
              <div className="h-4 w-full animate-pulse rounded bg-black/5" />
              <div className="h-4 w-full animate-pulse rounded bg-black/5" />
              <div className="h-4 w-2/3 animate-pulse rounded bg-black/5" />
            </div>
          </div>

          {/* PdpAssurance placeholder card */}
          <div className="mt-6 h-48 animate-pulse rounded-md bg-black/5" />
        </div>
      </div>
    </article>
  );
}
