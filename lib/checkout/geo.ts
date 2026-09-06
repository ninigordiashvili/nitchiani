/**
 * EchoDesk's guest-checkout address (`GuestAddressRequest`) accepts only `address`, `city`
 * and `label` — the `latitude`/`longitude` pair exists on `ClientAddress`, which is for
 * registered customers, and our shoppers check out as guests.
 *
 * So a picked pin can't ride along as structured data. Rather than drop it, we append a
 * Google Maps link to the order notes, which guest checkout does accept and which whoever
 * packs the order already reads. A courier can tap it and get turn-by-turn directions to
 * the exact spot — the point of asking for a pin at all.
 */

/** Six decimals is ~10cm — past that the digits are noise on a delivery address. */
export function mapsLink(lat: number, lng: number): string {
  return `https://www.google.com/maps?q=${lat.toFixed(6)},${lng.toFixed(6)}`;
}

export function isUsableCoordinate(lat?: number, lng?: number): boolean {
  return (
    typeof lat === "number" &&
    typeof lng === "number" &&
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    Math.abs(lat) <= 90 &&
    Math.abs(lng) <= 180 &&
    // Null Island is what a dropped/zeroed coordinate looks like, never a Georgian address.
    !(lat === 0 && lng === 0)
  );
}

/**
 * Order notes with the map pin appended. Returns the notes unchanged when there is no
 * usable coordinate, and undefined when that leaves nothing to send.
 */
export function composeNotes(
  notes: string | undefined,
  lat?: number,
  lng?: number,
): string | undefined {
  const base = notes?.trim() ?? "";
  if (!isUsableCoordinate(lat, lng)) return base || undefined;
  const pin = `📍 ${mapsLink(lat as number, lng as number)}`;
  return base ? `${base}\n\n${pin}` : pin;
}
