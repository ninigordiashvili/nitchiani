/**
 * The delivery area, as one definition shared by everything that has to agree on it: the
 * checkout map, the pin guard, and the server-side geocode route. Kept apart from
 * `lib/maps/loader.ts` so the server route can import it without pulling in browser-only code.
 *
 * Georgia's mainland extent, rounded outward so that no real address falls outside it —
 * Batumi and the Black Sea coast in the west, Lagodekhi in the east, the Greater Caucasus
 * in the north, and the Armenian/Turkish border in the south.
 */
export const GEORGIA_BOUNDS = {
  south: 41.0,
  north: 43.6,
  west: 39.9,
  east: 46.8,
} as const;

/** Google's `LatLngBoundsLiteral` shape, for `Map`'s `restriction` option. */
export const GEORGIA_LATLNG_BOUNDS = {
  south: GEORGIA_BOUNDS.south,
  north: GEORGIA_BOUNDS.north,
  west: GEORGIA_BOUNDS.west,
  east: GEORGIA_BOUNDS.east,
};

export function isInGeorgia(lat: number, lng: number): boolean {
  return (
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    lat >= GEORGIA_BOUNDS.south &&
    lat <= GEORGIA_BOUNDS.north &&
    lng >= GEORGIA_BOUNDS.west &&
    lng <= GEORGIA_BOUNDS.east
  );
}
