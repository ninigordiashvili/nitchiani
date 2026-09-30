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

/** The card choices checkout's form knows. Each names one bank. */
export type CardMethod = "bog_card" | "tbc_card";

export type CardOption = {
  method: CardMethod;
  /**
   * What EchoDesk is asked to charge through (`payment_provider`). Undefined only for the
   * single neutral option, which lets EchoDesk use the shop's default.
   */
  provider?: string;
  title: string;
  desc: string;
};

/**
 * One card option per bank the shop has live, so the shopper picks the bank and lands on
 * that bank's page.
 *
 * TBC is reached through Flitt, TBC's own card gateway, whenever Flitt is live; EchoDesk's
 * separate `tbc` provider (TBC's direct API) is the fallback. Both are the same bank to the
 * shopper, so they share one option — offering "TBC" twice would be the same payment under
 * two names.
 */
export function cardOptions(providers: string[]): CardOption[] {
  const options: CardOption[] = [];
  if (providers.includes("bog")) {
    options.push({ method: "bog_card", provider: "bog", title: "checkout.bogCard", desc: "checkout.bogCardDesc" });
  }
  const tbcProvider = providers.includes("flitt") ? "flitt" : providers.includes("tbc") ? "tbc" : null;
  if (tbcProvider) {
    options.push({ method: "tbc_card", provider: tbcProvider, title: "checkout.tbcCard", desc: "checkout.tbcCardDesc" });
  }
  // A live provider we have no bank wording for: one neutral option rather than none, and
  // rather than a guessed bank name.
  if (options.length === 0 && providers.length > 0) {
    options.push({ method: "bog_card", title: "checkout.cardGeneric", desc: "checkout.cardGenericDesc" });
  }
  return options;
}

/**
 * The provider to send for the card method the shopper chose. Null means the shop can't take
 * that method right now — it must refuse the order, never charge through some other bank.
 */
export function providerForMethod(
  method: string,
  providers: string[],
): { provider?: string } | null {
  const option = cardOptions(providers).find((o) => o.method === method);
  return option ? { provider: option.provider } : null;
}
