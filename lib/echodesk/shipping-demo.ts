import type { Courier, ShippingOption } from "./shipping";

/**
 * Sample courier quotes, for showing the shipping step before QuickShipper is connected.
 *
 * Off unless `SHIPPING_DEMO_COURIERS=1`. Server-only — no `NEXT_PUBLIC_` prefix — so it can
 * never be switched on from a browser, and it is not set on the host.
 *
 * It is also a *fallback*, never an override: the caller reaches for it only when the real
 * quote came back empty. The day the credentials work, live prices win on their own and this
 * stops being consulted, even if someone leaves the variable set.
 *
 * The shape and the numbers mirror a real response from the API, so the layout is exercised
 * honestly — several couriers, a wide price spread, and one company quoted at three tiers,
 * which is the case that broke courier selection the first time.
 */
export const isShippingDemo = process.env.SHIPPING_DEMO_COURIERS === "1";

const DEMO_COURIERS: Courier[] = [
  { key: "16:57", id: 16, feeId: "57", name: "Georgian Post", speed: "4 working days delivery", logoUrl: null, price: 8.01 },
  { key: "23:104", id: 23, feeId: "104", name: "OnWay", speed: "1-2 working days", logoUrl: null, price: 8.21 },
  { key: "4:2", id: 4, feeId: "2", name: "Easy Way", speed: "2 working days delivery", logoUrl: null, price: 8.71 },
  { key: "31:200", id: 31, feeId: "200", name: "Go Delivery", speed: "45-60 min. 🛵", logoUrl: null, price: 12.47 },
  { key: "31:201", id: 31, feeId: "201", name: "Go Delivery", speed: "45-60 min. 🚗", logoUrl: null, price: 13.1 },
  { key: "12:88", id: 12, feeId: "88", name: "Glovo", speed: "45-60 min ⚡", logoUrl: null, price: 13.83 },
  { key: "9:31", id: 9, feeId: "31", name: "Wolt", speed: "45-60 min. 🚀", logoUrl: null, price: 16.32 },
  { key: "31:202", id: 31, feeId: "202", name: "Go Delivery", speed: "45-60 min. 🚚", logoUrl: null, price: 19.47 },
];

export function demoQuote(): ShippingOption {
  console.warn(
    "[echodesk/shipping] SHIPPING_DEMO_COURIERS is on — serving sample courier prices, not real quotes",
  );
  const cheapest = DEMO_COURIERS[0];
  return {
    price: cheapest.price,
    label: cheapest.name,
    methodId: null,
    estimatedDays: null,
    source: "quote",
    couriers: DEMO_COURIERS,
    courierId: cheapest.id,
    feeId: cheapest.feeId,
  };
}
