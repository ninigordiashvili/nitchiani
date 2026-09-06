import { isBogConfigured } from "./bog";
import { isTbcConfigured } from "./tbc";

/**
 * Payment availability is expressed twice, and the two halves have to agree:
 *
 *   - `NEXT_PUBLIC_*_ENABLED` decides whether checkout *offers* the method. It has to be
 *     public, because the option list is rendered in a client component.
 *   - The secret credentials decide whether `/api/checkout/initiate` can actually *fulfil* it.
 *
 * Set the public flag without the credentials and a shopper picks the card option, fills in
 * the whole form, and only then gets "card payments are not yet enabled" — the worst possible
 * moment to find out. Nothing in the type system couples the two, so this checks it at boot
 * and says so loudly.
 */
export type PaymentConfigProblem = {
  method: "bog_card" | "tbc_card";
  missing: string[];
};

export function findPaymentConfigProblems(): PaymentConfigProblem[] {
  const problems: PaymentConfigProblem[] = [];

  // When EchoDesk is the backend it brokers card payments itself and returns a payment_url,
  // so our own BOG/TBC credentials are irrelevant — checkout never reaches those branches.
  // Without this, switching the card option on would log a permanent false alarm.
  if (process.env.NEXT_PUBLIC_ECHODESK_API_URL) return problems;

  if (process.env.NEXT_PUBLIC_BOG_ENABLED === "true" && !isBogConfigured) {
    problems.push({
      method: "bog_card",
      missing: ["BOG_CLIENT_ID", "BOG_CLIENT_SECRET"].filter((k) => !process.env[k]),
    });
  }

  if (process.env.NEXT_PUBLIC_TBC_ENABLED === "true" && !isTbcConfigured) {
    problems.push({
      method: "tbc_card",
      missing: ["TBC_API_KEY", "TBC_CLIENT_ID", "TBC_CLIENT_SECRET"].filter(
        (k) => !process.env[k],
      ),
    });
  }

  return problems;
}

/** Logs any mismatch. Called from `instrumentation.ts` so it runs once per server boot. */
export function reportPaymentConfig(): void {
  for (const p of findPaymentConfigProblems()) {
    console.error(
      `[payments] ${p.method} is switched ON for checkout but cannot be fulfilled — ` +
        `missing: ${p.missing.join(", ")}. Shoppers will be offered this method and then ` +
        `blocked at the final step. Either set the credentials or turn the NEXT_PUBLIC flag off.`,
    );
  }
}
