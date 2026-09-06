import type { EchoDeskStoreConfig } from "./types";

/**
 * Which payment methods checkout may offer.
 *
 * Read from the tenant rather than from env vars. The two drifted: EchoDesk had card payments
 * switched off and cash on delivery on, while the storefront advertised the exact opposite,
 * so the only method a shopper could pick was one the backend would refuse. An env var is a
 * copy of a setting that lives somewhere else, and copies go stale silently.
 *
 * `bankTransfer` is not in here: it needs no gateway and no backend switch, because choosing
 * it hands the shopper a chat rather than placing an order.
 */
export type PaymentAvailability = {
  card: boolean;
  cashOnDelivery: boolean;
};

/**
 * `enable_card_payment` is the tenant's switch, but a provider has to be live behind it —
 * a shop can enable cards before the bank has issued credentials, and offering the option
 * then just moves the failure to the last step.
 */
export function paymentAvailability(config: EchoDeskStoreConfig | null): PaymentAvailability {
  const payment = config?.payment;
  const providers = payment?.active_providers ?? [];
  const cardProviderLive = providers.some((p) => p !== "cash");

  return {
    card: Boolean(payment?.enable_card_payment) && cardProviderLive,
    cashOnDelivery: Boolean(payment?.enable_cash_on_delivery),
  };
}

/**
 * Fallback for when EchoDesk isn't the backend — the sample-data storefront still needs to
 * render a checkout, and there the env vars are the only source there is.
 */
export function envPaymentAvailability(): PaymentAvailability {
  return {
    card:
      process.env.NEXT_PUBLIC_BOG_ENABLED === "true" ||
      process.env.NEXT_PUBLIC_TBC_ENABLED === "true",
    cashOnDelivery: process.env.NEXT_PUBLIC_COD_ENABLED === "true",
  };
}
