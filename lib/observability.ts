/**
 * Tiny error-reporting shim. Today it emits a single structured line (so failures are
 * greppable in Vercel/host logs with their context attached, instead of scattered
 * `console.error` calls). It's the seam for real monitoring: when a provider is added,
 * forward from the one place below — every call site already passes useful context.
 *
 * Isomorphic: safe to call from server routes AND client components (e.g. error.tsx).
 *
 * Upgrade path (Sentry): `npm i @sentry/nextjs`, then inside `reportError` add
 *   `import("@sentry/nextjs").then((S) => S.captureException(error, { extra: context }))`
 * gated on `process.env.NEXT_PUBLIC_SENTRY_DSN`. No call site changes.
 */
export type ErrorContext = Record<string, unknown>;

export function reportError(
  error: unknown,
  context: ErrorContext = {},
): void {
  const err = error instanceof Error ? error : new Error(String(error));

  // Structured, single-line payload — easy to filter in a log drain.
  const payload = {
    level: "error",
    message: err.message,
    stack: err.stack,
    ...context,
  };

  // eslint-disable-next-line no-console -- this IS the logging sink
  console.error("[reportError]", JSON.stringify(payload));
}
