import { NextResponse } from "next/server";
import { isInGeorgia } from "@/lib/maps/bounds";

/**
 * Reverse geocoding proxy: coordinates in, a written address out.
 *
 * This exists because Google refuses the Geocoding API to any browser key carrying HTTP
 * referrer restrictions — "API keys with referer restrictions cannot be used with this API".
 * Dropping those restrictions to satisfy it would leave our public Maps key open to anyone
 * who views source, so the call is made here instead, with a separate server-side key that
 * never reaches the browser.
 *
 * Unset `GOOGLE_MAPS_SERVER_KEY` and the route reports the feature as off; the picker then
 * keeps the address the customer wrote and still records the pin, which is what reaches the
 * courier either way.
 */
const SERVER_KEY = process.env.GOOGLE_MAPS_SERVER_KEY ?? "";

export async function GET(req: Request) {
  if (!SERVER_KEY) {
    return NextResponse.json({ error: "not_configured" }, { status: 501 });
  }

  const url = new URL(req.url);
  const lat = Number(url.searchParams.get("lat"));
  const lng = Number(url.searchParams.get("lng"));
  const language = url.searchParams.get("language") === "en" ? "en" : "ka";

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return NextResponse.json({ error: "bad_coordinates" }, { status: 400 });
  }
  // This endpoint spends money per call, so it only answers for coordinates the store could
  // deliver to — an open worldwide geocoder on a public URL is someone else's free API.
  if (!isInGeorgia(lat, lng)) {
    return NextResponse.json({ error: "out_of_area" }, { status: 400 });
  }

  const endpoint = new URL("https://maps.googleapis.com/maps/api/geocode/json");
  endpoint.searchParams.set("latlng", `${lat},${lng}`);
  endpoint.searchParams.set("language", language);
  endpoint.searchParams.set("key", SERVER_KEY);

  try {
    const res = await fetch(endpoint, { cache: "no-store" });
    const data = (await res.json()) as {
      status: string;
      error_message?: string;
      results?: {
        formatted_address: string;
        address_components: { long_name: string; types: string[] }[];
      }[];
    };

    if (data.status === "ZERO_RESULTS") {
      // A pin in a field or on water. Not an error — there is simply nothing to name.
      return NextResponse.json({ address: null });
    }
    if (data.status !== "OK" || !data.results?.length) {
      // Log the real reason for us; tell the client only that it didn't work, since the
      // message can name the key's configuration.
      console.error("[api/geocode] rejected:", data.status, data.error_message ?? "");
      return NextResponse.json({ error: "lookup_failed" }, { status: 502 });
    }

    const best = data.results[0];
    const comp = (type: string) =>
      best.address_components.find((c) => c.types.includes(type))?.long_name;

    // Street + number only: the city and postcode have their own fields on the form, and
    // Google's formatted line would duplicate them onto the parcel label.
    const street = [comp("route"), comp("street_number")].filter(Boolean).join(" ");

    return NextResponse.json({
      address: street || best.formatted_address,
      city: comp("locality") ?? comp("administrative_area_level_1") ?? null,
      postalCode: comp("postal_code") ?? null,
    });
  } catch (err) {
    console.error("[api/geocode] request threw:", err);
    return NextResponse.json({ error: "lookup_failed" }, { status: 502 });
  }
}
