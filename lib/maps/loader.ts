/**
 * Loads the Google Maps JS API once per page, on demand.
 *
 * The script is ~300KB and checkout is the only screen that needs it, so it is fetched when
 * the customer first focuses the address field rather than on every page load. Callers get
 * the same promise back, so a focus/blur/focus cycle loads nothing extra.
 *
 * Returns null when no key is configured. Every caller must handle that: without a key the
 * address field stays an ordinary text input, which is the pre-existing behaviour and still
 * places orders correctly. A checkout that breaks because an env var is missing is a worse
 * failure than one without map assist.
 */
const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";

export const isMapsConfigured = API_KEY.length > 0;

/** Bias and restrict results to Georgia — the only country the store delivers to. */
export const COUNTRY = "ge";

/** Tbilisi. The map opens here when the customer has not picked anything yet. */
export const DEFAULT_CENTER = { lat: 41.7151, lng: 44.8271 };

let pending: Promise<typeof google.maps | null> | null = null;

export function loadMaps(language: string): Promise<typeof google.maps | null> {
  if (!isMapsConfigured) return Promise.resolve(null);
  if (typeof window === "undefined") return Promise.resolve(null);
  if (pending) return pending;

  pending = new Promise((resolve) => {
    // `google.maps.importLibrary` is defined by the bootstrap loader below; if some other
    // component already ran it, reuse rather than injecting a second script tag (which the
    // API logs as an error and which double-bills autocomplete sessions).
    // `typeof` rather than a truthiness check: the API's own type declarations mark
    // `importLibrary` as always present, so a plain check is a compile error even though at
    // runtime the whole `google` global is absent until the script lands.
    if (typeof window.google?.maps?.importLibrary === "function") {
      resolve(window.google.maps);
      return;
    }

    // Google assigns `google.maps.importLibrary` asynchronously, *after* the script's own
    // `onload` fires. Resolving on `onload` therefore hands callers a `google.maps` whose
    // `importLibrary` is still undefined — which threw `p.importLibrary is not a function`
    // the first time the map was opened. The `callback` parameter is the documented
    // handshake: Google invokes it once the API is genuinely ready.
    const CALLBACK = "__nitchianiMapsReady";
    const settle = (value: typeof google.maps | null) => {
      delete (window as unknown as Record<string, unknown>)[CALLBACK];
      if (value === null) pending = null; // let a later attempt retry
      resolve(value);
    };

    (window as unknown as Record<string, unknown>)[CALLBACK] = () =>
      settle(window.google?.maps ?? null);

    const script = document.createElement("script");
    const params = new URLSearchParams({
      key: API_KEY,
      // `places` for autocomplete, `maps`/`marker` for the pin. Geocoding is deliberately
      // absent: Google rejects referrer-restricted keys for that API, so the reverse lookup
      // goes through our own server route instead (app/api/geocode/route.ts).
      libraries: "places,maps,marker",
      // Google localises its own suggestion text and map labels from this.
      language,
      region: COUNTRY.toUpperCase(),
      loading: "async",
      callback: CALLBACK,
      v: "weekly",
    });
    script.src = `https://maps.googleapis.com/maps/api/js?${params.toString()}`;
    script.async = true;
    script.onerror = () => {
      // A blocked or rejected key must not take checkout down with it: resolve null and the
      // caller falls back to the plain input.
      console.warn("[maps] Google Maps failed to load — address field stays a plain input");
      settle(null);
    };
    // A rejected key (wrong referrer, billing off) loads a script that logs its complaint and
    // never calls the callback, which would otherwise leave the field spinning forever.
    setTimeout(() => {
      if ((window as unknown as Record<string, unknown>)[CALLBACK]) {
        console.warn("[maps] Google Maps did not initialise — check the API key restrictions");
        settle(null);
      }
    }, 10_000);
    document.head.appendChild(script);
  });

  return pending;
}
