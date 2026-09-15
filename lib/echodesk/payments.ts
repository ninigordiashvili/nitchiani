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
  /** Card providers the tenant has live, e.g. `["bog"]`. Names the option honestly. */
  providers: string[];
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
    providers: providers.filter((p) => p !== "cash"),
  };
}

/**
 * Fallback for when EchoDesk isn't the backend — the sample-data storefront still needs to
 * render a checkout, and there the env vars are the only source there is.
 */
export function envPaymentAvailability(): PaymentAvailability {
  const providers: string[] = [];
  if (process.env.NEXT_PUBLIC_BOG_ENABLED === "true") providers.push("bog");
  if (process.env.NEXT_PUBLIC_TBC_ENABLED === "true") providers.push("tbc");
  return {
    card: providers.length > 0,
    cashOnDelivery: process.env.NEXT_PUBLIC_COD_ENABLED === "true",
    providers,
  };
}

/**
 * Message keys for a provider's option, so the card choice names the bank the shopper will
 * actually land on rather than a bank we guessed.
 */
export function cardLabelKeys(providers: string[]): { title: string; desc: string } {
  if (providers.length === 1 && providers[0] === "bog") {
    return { title: "checkout.bogCard", desc: "checkout.bogCardDesc" };
  }
  if (providers.length === 1 && providers[0] === "tbc") {
    return { title: "checkout.tbcCard", desc: "checkout.tbcCardDesc" };
  }
  // Several live, or one we have no wording for: stay neutral rather than name it wrongly.
  return { title: "checkout.cardGeneric", desc: "checkout.cardGenericDesc" };
}
