/**
 * Next.js runs `register()` once per server boot. Used here to surface configuration
 * mistakes at startup rather than letting a shopper discover them at the payment step.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { reportPaymentConfig } = await import("./lib/payments/config");
    reportPaymentConfig();
  }
}
