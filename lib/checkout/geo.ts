/**
 * Coordinate sanity check for the pin the checkout map picker produces.
 *
 * EchoDesk's guest-checkout address (`GuestAddressRequest`) takes `latitude`/`longitude`
 * directly, so the pin travels as structured data and the courier's own system reads it.
 * This is the gate: a half-filled or zeroed pair is worse than none, because the backend
 * would quote and dispatch against it.
 */

/**
 * True only for a coordinate worth sending.
 *
 * Both halves, both finite, both in range — and not Null Island, which is what a dropped or
 * zeroed coordinate looks like and never a Georgian address.
 */
export function isUsableCoordinate(lat?: number, lng?: number): boolean {
  return (
    typeof lat === "number" &&
    typeof lng === "number" &&
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    Math.abs(lat) <= 90 &&
    Math.abs(lng) <= 180 &&
    !(lat === 0 && lng === 0)
  );
}
