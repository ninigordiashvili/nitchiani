"use client";

import { Loader2, MapPin, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { COUNTRY, DEFAULT_CENTER, isMapsConfigured, loadMaps } from "@/lib/maps/loader";
import { cn } from "@/lib/utils";

export type PickedPlace = {
  /** Street line, as it should be typed on the parcel. */
  address: string;
  city?: string;
  postalCode?: string;
  lat?: number;
  lng?: number;
};

type Suggestion = { id: string; primary: string; secondary: string };

/**
 * Address field with Google Places assist.
 *
 * Three ways in, because a courier needs a findable address and Georgian addressing is not
 * uniform: pick a suggestion, drop a pin on the map, or just type. Typing is never blocked —
 * many Tbilisi buildings are not in Places, and refusing an order because Google has not
 * heard of a street would cost real sales.
 *
 * With no `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` this renders exactly the plain input it replaced.
 *
 * Uses the current Places API (`AutocompleteSuggestion` + `Place`) rather than the legacy
 * `Autocomplete` widget, which Google closed to new API keys in March 2025 — a key created
 * for this store today would not work with it. Fetching suggestions as data instead of using
 * the drop-in `PlaceAutocompleteElement` also lets the dropdown inherit the store's styling
 * instead of Google's.
 */
export function AddressPicker({
  value,
  onChange,
  onPlace,
  onBlur,
  className,
  ariaInvalid,
}: {
  value: string;
  onChange: (value: string) => void;
  /** Fired when a suggestion is chosen or the pin moved — carries city/postcode/coords. */
  onPlace: (place: PickedPlace) => void;
  onBlur?: () => void;
  className?: string;
  ariaInvalid?: boolean;
}) {
  const t = useTranslations("checkout");
  const locale = useLocale();
  const listId = useId();

  const [maps, setMaps] = useState<typeof google.maps | null>(null);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(-1);
  const [mapOpen, setMapOpen] = useState(false);
  // Set when Google refuses to draw the map (a referrer the key doesn't allow, billing off,
  // quota). Google paints its own grey "something went wrong" panel into the container, which
  // on a checkout page reads as the store being broken. We hide the map instead and leave the
  // customer typing, which always works.
  const [mapUnavailable, setMapUnavailable] = useState(false);
  const [pinned, setPinned] = useState<{ lat: number; lng: number } | null>(null);

  const sessionRef = useRef<google.maps.places.AutocompleteSessionToken | null>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const mapNodeRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(null);
  // Guards against a slow response for an earlier keystroke overwriting a newer one.
  const seqRef = useRef(0);
  // Releasing a marker drag also reaches the map as a `click`, so a single gesture asked the
  // server to name two nearly-identical points — and geocoding is billed per request. The
  // click handler consults this and stands down while a drag is in flight.
  const draggingRef = useRef(false);

  const ensureMaps = useCallback(async () => {
    if (maps || !isMapsConfigured) return maps;
    setLoading(true);
    const loaded = await loadMaps(locale);
    setLoading(false);
    setMaps(loaded);
    return loaded;
  }, [maps, locale]);

  // Debounced suggestion fetch. 250ms is long enough that a fast typist spends one request
  // per word rather than per letter — this endpoint is billed per session, and per request
  // when a session is abandoned.
  useEffect(() => {
    if (!maps || value.trim().length < 3) {
      setSuggestions([]);
      return;
    }
    const seq = ++seqRef.current;
    const timer = setTimeout(async () => {
      try {
        const { AutocompleteSessionToken, AutocompleteSuggestion } = (await maps.importLibrary(
          "places",
        )) as google.maps.PlacesLibrary;
        sessionRef.current ??= new AutocompleteSessionToken();
        const { suggestions: raw } = await AutocompleteSuggestion.fetchAutocompleteSuggestions({
          input: value,
          sessionToken: sessionRef.current,
          includedRegionCodes: [COUNTRY],
          language: locale,
          region: COUNTRY,
        });
        if (seq !== seqRef.current) return; // a newer keystroke already won
        setSuggestions(
          raw
            .map((s) => {
              const p = s.placePrediction;
              if (!p) return null;
              return {
                id: p.placeId,
                primary: p.mainText?.toString() ?? p.text.toString(),
                secondary: p.secondaryText?.toString() ?? "",
              };
            })
            .filter((s): s is Suggestion => s !== null)
            .slice(0, 5),
        );
      } catch (err) {
        // Quota, referrer restriction, network — none of which should break typing.
        console.warn("[maps] suggestion lookup failed:", err);
        if (seq === seqRef.current) setSuggestions([]);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [value, maps, locale]);

  /** Pull a chosen place apart into the fields the order needs. */
  const applyPlaceId = useCallback(
    async (placeId: string) => {
      if (!maps) return;
      try {
        const { Place } = (await maps.importLibrary("places")) as google.maps.PlacesLibrary;
        const place = new Place({ id: placeId, requestedLanguage: locale });
        await place.fetchFields({
          fields: ["formattedAddress", "addressComponents", "location", "displayName"],
        });
        const comp = (type: string) =>
          place.addressComponents?.find((c) => c.types.includes(type))?.longText ?? undefined;

        // Prefer street + number over Google's formatted line, which tacks on the city,
        // postcode and "Georgia" — all of which have their own fields on this form and
        // would otherwise be duplicated on the parcel label.
        const street = [comp("route"), comp("street_number")].filter(Boolean).join(" ");
        const named = place.displayName ?? "";
        const line = street || named || place.formattedAddress || "";

        const lat = place.location?.lat();
        const lng = place.location?.lng();
        if (lat !== undefined && lng !== undefined) setPinned({ lat, lng });

        onChange(line);
        onPlace({
          address: line,
          city: comp("locality") ?? comp("administrative_area_level_1"),
          postalCode: comp("postal_code"),
          lat,
          lng,
        });
      } catch (err) {
        console.warn("[maps] place details failed:", err);
      } finally {
        // A session ends at the details call; the next keystroke starts a fresh one.
        sessionRef.current = null;
        setOpen(false);
        setSuggestions([]);
      }
    },
    [maps, locale, onChange, onPlace],
  );

  /** Reverse-geocode after the pin is dragged so the written address follows the marker. */
  const applyLatLng = useCallback(
    async (lat: number, lng: number) => {
      setPinned({ lat, lng });
      // Record the pin first and unconditionally. Naming it is a nicety; the coordinates are
      // what actually get the courier there, and they must survive a failed lookup.
      onPlace({ address: value, lat, lng });

      try {
        // Our own route, not Google directly: the Geocoding API rejects any browser key with
        // referrer restrictions, and dropping those would expose the public Maps key.
        // See app/api/geocode/route.ts.
        const res = await fetch(
          `/api/geocode?lat=${lat}&lng=${lng}&language=${encodeURIComponent(locale)}`,
        );
        if (!res.ok) return; // includes 501 when no server key is configured
        const data = (await res.json()) as {
          address?: string | null;
          city?: string | null;
          postalCode?: string | null;
        };
        if (!data.address) return;
        onChange(data.address);
        onPlace({
          address: data.address,
          city: data.city ?? undefined,
          postalCode: data.postalCode ?? undefined,
          lat,
          lng,
        });
      } catch (err) {
        // Keep the coordinates even if the words fail — a pin alone still delivers.
        console.warn("[maps] reverse geocode failed:", err);
      }
    },
    [locale, onChange, onPlace, value],
  );

  // Build the map lazily, the first time it is opened.
  useEffect(() => {
    if (!mapOpen || !maps || !mapNodeRef.current || mapRef.current) return;
    let cancelled = false;
    void (async () => {
      const [{ Map }, { AdvancedMarkerElement }] = await Promise.all([
        maps.importLibrary("maps") as Promise<google.maps.MapsLibrary>,
        maps.importLibrary("marker") as Promise<google.maps.MarkerLibrary>,
      ]);
      if (cancelled || !mapNodeRef.current) return;
      const center = pinned ?? DEFAULT_CENTER;
      const map = new Map(mapNodeRef.current, {
        center,
        zoom: pinned ? 17 : 12,
        disableDefaultUI: true,
        zoomControl: true,
        clickableIcons: false,
        // An Advanced Marker needs a map id; "DEMO_MAP_ID" is Google's own no-styling id and
        // needs no Cloud console setup, which keeps this working on a fresh key.
        mapId: "DEMO_MAP_ID",
      });
      const marker = new AdvancedMarkerElement({ map, position: center, gmpDraggable: true });
      marker.addListener("dragstart", () => {
        draggingRef.current = true;
      });
      marker.addListener("dragend", () => {
        const p = marker.position;
        if (!p) return;
        const lat = typeof p.lat === "function" ? p.lat() : (p.lat as number);
        const lng = typeof p.lng === "function" ? p.lng() : (p.lng as number);
        void applyLatLng(lat, lng);
        // Cleared on a later tick: the click this drag generates arrives after `dragend`.
        setTimeout(() => {
          draggingRef.current = false;
        }, 400);
      });
      // Tapping the map is easier than dragging a small pin on a phone.
      map.addListener("click", (e: google.maps.MapMouseEvent) => {
        if (!e.latLng || draggingRef.current) return;
        marker.position = e.latLng;
        void applyLatLng(e.latLng.lat(), e.latLng.lng());
      });
      mapRef.current = map;
      markerRef.current = marker;

      // Google reports these failures by injecting an error panel, not by throwing, so the
      // only way to notice is to look for it once tiles have had a moment to load.
      setTimeout(() => {
        if (mapNodeRef.current?.querySelector(".gm-err-container")) {
          console.warn("[maps] map refused to render — check the API key's referrer settings");
          setMapUnavailable(true);
          setMapOpen(false);
          mapRef.current = null;
          markerRef.current = null;
        }
      }, 2500);
    })();
    return () => {
      cancelled = true;
    };
  }, [mapOpen, maps, pinned, applyLatLng]);

  // Keep the pin in step with a place chosen from the dropdown while the map is open.
  useEffect(() => {
    if (!pinned || !mapRef.current || !markerRef.current) return;
    markerRef.current.position = pinned;
    mapRef.current.panTo(pinned);
    mapRef.current.setZoom(17);
  }, [pinned]);

  // Close the dropdown on an outside click.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!boxRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open || suggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => (h + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => (h <= 0 ? suggestions.length - 1 : h - 1));
    } else if (e.key === "Enter" && highlight >= 0) {
      // Only swallow Enter when a suggestion is actually highlighted, so the key still
      // submits the form the rest of the time.
      e.preventDefault();
      void applyPlaceId(suggestions[highlight].id);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  const inputCls =
    "w-full rounded-md border border-black/15 bg-white/60 px-3 py-2.5 text-sm focus:border-[var(--color-brand-ink)] focus:outline-none";

  // No key configured → the plain field, unchanged.
  if (!isMapsConfigured) {
    return (
      <input
        className={cn(inputCls, className)}
        aria-required
        aria-invalid={ariaInvalid}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        autoComplete="street-address"
      />
    );
  }

  return (
    <div ref={boxRef} className="relative">
      <div className="relative">
        <input
          className={cn(inputCls, "pr-9", className)}
          aria-required
          aria-invalid={ariaInvalid}
          role="combobox"
          aria-expanded={open && suggestions.length > 0}
          aria-controls={listId}
          aria-autocomplete="list"
          autoComplete="off"
          value={value}
          placeholder={t("addressPlaceholder")}
          onFocus={() => {
            void ensureMaps();
            setOpen(true);
          }}
          onChange={(e) => {
            onChange(e.target.value);
            setOpen(true);
            setHighlight(-1);
          }}
          onKeyDown={onKeyDown}
          onBlur={onBlur}
        />
        {loading ? (
          <Loader2
            size={16}
            aria-hidden
            className="absolute top-1/2 right-3 -translate-y-1/2 animate-spin opacity-50"
          />
        ) : null}
      </div>

      {open && suggestions.length > 0 ? (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-20 mt-1 w-full overflow-hidden rounded-md border border-black/15 bg-white shadow-lg"
        >
          {suggestions.map((s, i) => (
            <li key={s.id}>
              <button
                type="button"
                role="option"
                aria-selected={i === highlight}
                // `onMouseDown` rather than `onClick`: the input's blur would otherwise close
                // the list before the click lands.
                onMouseDown={(e) => {
                  e.preventDefault();
                  void applyPlaceId(s.id);
                }}
                onMouseEnter={() => setHighlight(i)}
                className={cn(
                  "flex w-full cursor-pointer items-start gap-2 px-3 py-2 text-left text-sm",
                  i === highlight ? "bg-black/5" : "hover:bg-black/5",
                )}
              >
                <MapPin size={14} className="mt-0.5 shrink-0 opacity-50" aria-hidden />
                <span className="min-w-0">
                  <span className="block truncate">{s.primary}</span>
                  {s.secondary ? (
                    <span className="block truncate text-xs opacity-60">{s.secondary}</span>
                  ) : null}
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      <div className="mt-1.5 flex items-center gap-3">
        {mapUnavailable ? null : (
        <button
          type="button"
          onClick={async () => {
            await ensureMaps();
            setMapOpen((v) => !v);
          }}
          className="inline-flex cursor-pointer items-center gap-1.5 text-xs underline-offset-2 opacity-80 hover:underline hover:opacity-100"
        >
          {mapOpen ? <X size={13} aria-hidden /> : <MapPin size={13} aria-hidden />}
          {mapOpen ? t("hideMap") : t("pickOnMap")}
        </button>
        )}
        {pinned ? (
          <span className="text-xs opacity-60">{t("pinSet")}</span>
        ) : null}
      </div>

      {mapOpen ? (
        <div className="mt-2">
          <div
            ref={mapNodeRef}
            className="h-56 w-full overflow-hidden rounded-md border border-black/15 bg-black/5"
          />
          <p className="mt-1.5 text-xs opacity-60">{t("mapHint")}</p>
        </div>
      ) : null}
    </div>
  );
}
