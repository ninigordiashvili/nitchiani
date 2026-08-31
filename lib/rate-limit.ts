/**
 * Minimal fixed-window, in-memory rate limiter keyed by an arbitrary identifier (usually IP).
 *
 * Scope & honesty: state lives in the module-level Map, so the limit is per server instance.
 * On a single long-running Node process this is a real, global limit. On serverless (Vercel)
 * each warm instance keeps its own counter — so it throttles per-instance bursts but is not a
 * hard global cap. For a strict global limit, swap the Map for Upstash Redis / @vercel/kv; the
 * `rateLimit` signature stays identical, so callers don't change.
 */

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();
const MAX_TRACKED = 10_000; // memory backstop against unbounded key growth

export type RateLimitResult = {
  ok: boolean;
  /** Seconds until the window resets — use for a `Retry-After` header. */
  retryAfter: number;
  /** Requests left in the current window (0 once blocked). */
  remaining: number;
};

export function rateLimit(
  key: string,
  opts: { limit: number; windowMs: number },
): RateLimitResult {
  const now = Date.now();
  const existing = buckets.get(key);

  // New key or expired window → start a fresh window.
  if (!existing || existing.resetAt <= now) {
    // Opportunistically prune expired buckets when the map grows large.
    if (buckets.size > MAX_TRACKED) {
      for (const [k, b] of buckets) if (b.resetAt <= now) buckets.delete(k);
    }
    buckets.set(key, { count: 1, resetAt: now + opts.windowMs });
    return { ok: true, retryAfter: 0, remaining: opts.limit - 1 };
  }

  if (existing.count >= opts.limit) {
    return {
      ok: false,
      retryAfter: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
      remaining: 0,
    };
  }

  existing.count += 1;
  return { ok: true, retryAfter: 0, remaining: opts.limit - existing.count };
}

/**
 * Best-effort client IP from a Request, for use as a rate-limit key. Mirrors the proxy-header
 * order Vercel/most CDNs set. Falls back to a constant so a missing IP buckets together rather
 * than throwing (degrades to a shared limit, which is the safe direction).
 */
export function clientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "0.0.0.0";
}

/** Test-only: clear all buckets so tests don't bleed into each other. */
export function __resetRateLimit(): void {
  buckets.clear();
}
