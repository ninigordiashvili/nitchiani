import type { Locale } from "../i18n/config";
import { parseEchoDeskGid } from "./adapt";
import { getStoreConfig, listShippingMethods } from "./client";
import { demoQuote, isShippingDemo } from "./shipping-demo";
import type { EchoDeskShippingMethod } from "./types";

/**
 * Delivery pricing, in two tiers.
 *
 * 1. A live QuickShipper quote for the exact pin the shopper dropped. Needs coordinates —
 *    `to_lat`/`to_lng` are required by the endpoint, not optional — which is why the map
 *    picker on the address field is what makes this possible at all.
 * 2. A flat shipping method configured on the tenant, for every address typed without a pin.
 *
 * Neither available means no delivery line at all and the shopper is charged for goods only,
 * which is exactly today's behaviour. That is the point: QuickShipper is off on the tenant
 * (`424 Quickshipper is not enabled`) and the one configured shipping method is a blank
 * placeholder, so this stays invisible until either is filled in, then appears on its own.
 */
const API_URL = process.env.NEXT_PUBLIC_ECHODESK_API_URL?.replace(/\/+$/, "");

export type ShippingOption = {
  /** GEL. */
  price: number;
  /** Shown beside the price when the backend gives it a name. */
  label: string | null;
  /** `shipping_method_id` for guest checkout; absent for a live courier quote. */
  methodId: number | null;
  estimatedDays: number | null;
  source: "quote" | "flat";
  /**
   * Every courier the quote returned, cheapest first. QuickShipper prices several — Georgian
   * Post, Wolt, Glovo and so on — and the shopper picks; the top-level fields describe
   * whichever is selected.
   */
  couriers?: Courier[];
  /** Identifies the chosen courier back to the backend. */
  courierId?: number | null;
  feeId?: string | null;
};

/** One courier from a QuickShipper quote. */
export type Courier = {
  /**
   * Identity for selection. `provider_id` alone is not unique: Go Delivery is quoted three
   * times — scooter, car and truck — under one provider id at three prices, so keying on it
   * charged the cheapest whichever the shopper picked. The fee id is the tier.
   */
  key: string;
  id: number;
  /** `provider_fee_id` — identifies the exact speed/price tier, not just the company. */
  feeId: string | null;
  name: string;
  /** e.g. "45-60 min." or "4 working days delivery". */
  speed: string | null;
  logoUrl: string | null;
  price: number;
};

/**
 * Cart lines carry a slug (`prod-002`) and a gid (`gid://echodesk/Product/3`); QuickShipper
 * wants the numeric product id. Only the gid has it — reading the slug as a number yields
 * NaN, which silently emptied the item list and made every quote a no-op.
 */
export function quoteItems(
  lines: { variantId: string; quantity: number }[],
): { productId: number; quantity: number }[] {
  return lines
    .map((l) => {
      const parsed = parseEchoDeskGid(l.variantId);
      // The parent product, not the variant: the quote is priced per product.
      return parsed?.productId ? { productId: parsed.productId, quantity: l.quantity } : null;
    })
    .filter((i): i is { productId: number; quantity: number } => i !== null);
}

/** The bit of EchoDesk's quote response we rely on. */
type EchoDeskQuote = {
  price?: number | string;
  cost?: number | string;
  amount?: number | string;
  provider_id?: number;
  provider_name?: string;
  provider_fee_id?: string;
  estimated_days?: number;
  courier?: string;
  provider?: string;
  options?: {
    provider_id: number;
    provider_name?: string;
    provider_fee_id?: string;
    provider_logo_url?: string;
    display_name?: string;
    price: number | string;
  }[];
};

export type QuoteInput = {
  items: { productId: number; quantity: number }[];
  street: string;
  city: string;
  lat: number;
  lng: number;
};

/**
 * First non-empty name, preferring the shopper's language.
 *
 * `??` won't do here: the backend stores an unfilled translation as `""`, not null, so
 * `value[locale] ?? value.en` returns the empty string and a method named only in English
 * would disappear from the Georgian storefront.
 */
function localized(value: EchoDeskShippingMethod["name"], locale: Locale): string {
  if (!value) return "";
  for (const candidate of [value[locale], value.en, value.ka]) {
    const trimmed = candidate?.trim();
    if (trimmed) return trimmed;
  }
  return "";
}

/**
 * The flat method to charge, or null when the tenant has none worth showing.
 *
 * A method with no name in either language is a placeholder someone created and never filled
 * in — the tenant has exactly one of those today. Charging by it would put an unlabelled line
 * on the bill, and showing it with an empty name is worse than not showing it.
 */
export function pickFlatMethod(
  methods: EchoDeskShippingMethod[],
  locale: Locale,
  subtotal: number,
): ShippingOption | null {
  const usable = methods
    .filter((m) => m.is_active !== false && localized(m.name, locale).length > 0)
    .sort((a, b) => (a.position ?? 0) - (b.position ?? 0));

  const method = usable[0];
  if (!method) return null;

  const price = Number.parseFloat(method.price ?? "0");
  if (!Number.isFinite(price) || price < 0) return null;

  // Free over a threshold, when the tenant sets one.
  const threshold = method.free_shipping_threshold
    ? Number.parseFloat(method.free_shipping_threshold)
    : null;
  const charged = threshold !== null && Number.isFinite(threshold) && subtotal >= threshold ? 0 : price;

  return {
    price: charged,
    label: localized(method.name, locale),
    methodId: method.id,
    estimatedDays: method.estimated_days ?? null,
    source: "flat",
  };
}

/**
 * Live courier quote. Returns null for every failure — QuickShipper switched off (424), a
 * malformed address, the service being down — because none of them should stop an order.
 * The caller falls back to the flat method, or to charging nothing.
 */
export async function quoteGuestShipping(input: QuoteInput): Promise<ShippingOption | null> {
  if (!API_URL) return null;
  try {
    const res = await fetch(`${API_URL}/api/ecommerce/client/shipping/quote-guest/`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        items: input.items.map((i) => ({ product_id: i.productId, quantity: i.quantity })),
        to_street: input.street,
        to_city: input.city,
        to_lat: input.lat,
        to_lng: input.lng,
      }),
      cache: "no-store",
    });
    if (!res.ok) {
      // 424 is the tenant switch being off, which is the normal state today — logged at info
      // level so it doesn't read as a fault in the logs every time someone checks out.
      if (res.status === 424) console.info("[echodesk/shipping] QuickShipper not enabled");
      else console.error("[echodesk/shipping] quote rejected:", res.status, await res.text());
      return null;
    }
    const data = (await res.json()) as EchoDeskQuote;

    // `options` is the real answer: QuickShipper prices every courier that will take the
    // parcel, and the top level merely repeats whichever the backend picked as default.
    // Reading only the top level would hide the choice and quietly charge the default.
    const couriers = (data.options ?? [])
      .map((o) => ({
        key: `${o.provider_id}:${o.provider_fee_id ?? ""}`,
        id: o.provider_id,
        feeId: o.provider_fee_id ?? null,
        name: (o.provider_name ?? "").trim(),
        speed: (o.display_name ?? "").trim() || null,
        logoUrl: o.provider_logo_url ?? null,
        price: typeof o.price === "string" ? Number.parseFloat(o.price) : o.price,
      }))
      .filter((c) => c.name && Number.isFinite(c.price) && c.price >= 0)
      .sort((a, b) => a.price - b.price);

    const raw = data.price ?? data.cost ?? data.amount;
    const topPrice = typeof raw === "string" ? Number.parseFloat(raw) : raw;
    const fallback = couriers[0];
    const price =
      topPrice !== undefined && Number.isFinite(topPrice) ? topPrice : fallback?.price;

    if (price === undefined || !Number.isFinite(price) || price < 0) {
      console.error("[echodesk/shipping] quote had no readable price:", JSON.stringify(data).slice(0, 300));
      return null;
    }

    return {
      price,
      label: data.provider_name ?? data.courier ?? data.provider ?? null,
      methodId: null,
      estimatedDays: data.estimated_days ?? null,
      source: "quote",
      couriers: couriers.length > 1 ? couriers : undefined,
      courierId: data.provider_id ?? fallback?.id ?? null,
      feeId: data.provider_fee_id ?? fallback?.feeId ?? null,
    };
  } catch (err) {
    console.error("[echodesk/shipping] quote threw:", err);
    return null;
  }
}

/** Live quote when there's a pin, flat method otherwise, nothing when neither is available. */
/**
 * The outcome of pricing delivery, rather than just a price or null.
 *
 * Null used to mean two very different things — "this shop charges nothing" and "this shop
 * charges by distance and we don't know where you are" — and both came out as free delivery.
 * That is fine for the first and a silent giveaway for the second.
 */
export type ShippingResolution =
  | { status: "priced"; option: ShippingOption }
  /** Courier pricing needs coordinates and none were given: ask for the map pin. */
  | { status: "needsLocation" }
  /** Coordinates were given but the courier couldn't be reached or refused to quote. */
  | { status: "unavailable" }
  /** The shop configures no delivery charge at all. */
  | { status: "unpriced" };

/**
 * The decision itself, separated from the fetching so it can be tested without a network:
 * given what we managed to look up, which of the four outcomes is it?
 */
export function decideShipping(input: {
  quote: ShippingOption | null;
  flat: ShippingOption | null;
  hasPin: boolean;
  courierOnly: boolean;
}): ShippingResolution {
  if (input.quote) return { status: "priced", option: input.quote };
  if (input.flat) return { status: "priced", option: input.flat };
  // No flat fallback. If the shop delivers by courier quote alone, an order can only be
  // priced from a pin — so say which of the two problems it is rather than shipping free.
  if (!input.courierOnly) return { status: "unpriced" };
  return input.hasPin ? { status: "unavailable" } : { status: "needsLocation" };
}

export async function resolveShipping(
  locale: Locale,
  subtotal: number,
  input: Omit<QuoteInput, "lat" | "lng"> & { lat?: number; lng?: number },
  chosenMethodId: number | null = null,
): Promise<ShippingResolution> {
  const methods = (await listShippingMethods())?.results ?? [];

  // An explicitly chosen method wins over a courier quote: picking collection at the store
  // and then being charged for a courier would be the worst of both.
  if (chosenMethodId !== null) {
    const picked = methods.find((m) => m.id === chosenMethodId);
    const option = picked ? pickFlatMethod([picked], locale, subtotal) : null;
    if (option) return { status: "priced", option };
  }

  const hasPin = input.lat !== undefined && input.lng !== undefined;
  const live = hasPin
    ? await quoteGuestShipping({ ...input, lat: input.lat as number, lng: input.lng as number })
    : null;
  // Sample prices stand in only where a real quote produced nothing, so live data always
  // wins and the switch turns itself off the day the credentials work. See shipping-demo.ts.
  // Deliberately not gated on the pin: the picker needs a working Maps key, and the point of
  // the demo is to show the shipping step when the pieces around it are not connected yet.
  const quote = live ?? (isShippingDemo ? demoQuote() : null);
  const flat = pickFlatMethod(methods, locale, subtotal);

  // Only asked when it changes the answer — a shop with a flat method never needs to know.
  const courierOnly =
    quote || flat
      ? false
      : (await getStoreConfig())?.shipping?.quickshipper_enabled === true;

  return decideShipping({ quote, flat, hasPin, courierOnly });
}

/**
 * The tenant's free-shipping threshold in GEL, or null when it sets none.
 *
 * Read rather than hardcoded because three places make this promise — the strip above the
 * header, the progress bar in the cart, and the delivery line at checkout — and a constant
 * in the code is a fourth copy that goes stale the moment the merchant edits the method.
 * Null means the shop makes no such promise, and the places that advertise it stay quiet.
 */
export async function getFreeShippingThreshold(locale: Locale): Promise<number | null> {
  const methods = await listShippingMethods();
  const option = pickFlatMethod(methods?.results ?? [], locale, 0);
  if (!option) return null;

  const method = (methods?.results ?? []).find((m) => m.id === option.methodId);
  const raw = method?.free_shipping_threshold;
  if (!raw) return null;

  const threshold = Number.parseFloat(raw);
  return Number.isFinite(threshold) && threshold > 0 ? threshold : null;
}

export type DeliveryChoice = {
  methodId: number;
  label: string;
  /** GEL, before any free-shipping threshold is applied. */
  price: number;
  estimatedDays: number | null;
};

/**
 * Every delivery method the shop offers, for the chooser at checkout.
 *
 * Collection at the store can appear here too, as a method priced 0. That is now a display
 * choice rather than the only way to express it: the order itself carries
 * `delivery_method: "pickup"` (see orders.ts), so the back office knows not to dispatch even
 * if the shop never configured a pickup method.
 */
export function deliveryChoices(
  methods: EchoDeskShippingMethod[],
  locale: Locale,
): DeliveryChoice[] {
  return methods
    .filter((m) => m.is_active !== false && localized(m.name, locale).length > 0)
    .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
    .map((m) => {
      const price = Number.parseFloat(m.price ?? "0");
      return {
        methodId: m.id,
        label: localized(m.name, locale),
        price: Number.isFinite(price) && price > 0 ? price : 0,
        estimatedDays: m.estimated_days ?? null,
      };
    });
}
