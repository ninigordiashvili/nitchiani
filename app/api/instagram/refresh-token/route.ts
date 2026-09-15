import { NextResponse } from "next/server";

/**
 * Refreshes the long-lived Instagram access token.
 *
 * NOTHING CALLS THIS ON A SCHEDULE. It was written for Vercel cron, declared in a vercel.json
 * that has been removed — the site is hosted on Netlify, where that file did nothing, so the
 * monthly refresh has never run. That costs nothing today because INSTAGRAM_ACCESS_TOKEN is
 * unset and `lib/instagram.ts` falls back to a plain profile link. The moment a token is set,
 * it expires 60 days later and the feed dies silently unless this is scheduled.
 *
 * To schedule it on Netlify: a Scheduled Function (netlify.toml `[functions."name".schedule]`,
 * or `@netlify/functions` `schedule()`) hitting this path with the bearer token below.
 *
 * The route returns the new token in the response body and logs it. Host env vars cannot be
 * mutated from runtime code, so you (or a downstream service) must write the new value back to
 * INSTAGRAM_ACCESS_TOKEN. Common patterns:
 *   - Read the new token from the deploy logs and update the env var by hand
 *   - Hook this route up to a Slack/Telegram webhook so the value reaches you
 *   - Move token storage somewhere mutable and read from there in lib/instagram.ts
 *
 * Manual trigger: curl -H "Authorization: Bearer $CRON_SECRET" https://yourdomain/api/instagram/refresh-token
 */
export async function GET(req: Request) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const token = process.env.INSTAGRAM_ACCESS_TOKEN;
  if (!token) {
    return NextResponse.json({ error: "INSTAGRAM_ACCESS_TOKEN not set" }, { status: 412 });
  }

  const url = new URL("https://graph.instagram.com/refresh_access_token");
  url.searchParams.set("grant_type", "ig_refresh_token");
  url.searchParams.set("access_token", token);

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    const text = await res.text();
    console.error("[ig/refresh] failed:", res.status, text);
    return NextResponse.json({ error: "refresh_failed", status: res.status, body: text }, { status: 502 });
  }

  const json = (await res.json()) as { access_token: string; expires_in: number };
  const expiresAt = new Date(Date.now() + json.expires_in * 1000);

  // Log loud and structured — easy to grep in Vercel logs once a month.
  console.info(
    "[ig/refresh] ✓ new long-lived token issued. UPDATE INSTAGRAM_ACCESS_TOKEN env var.",
    {
      expiresAt: expiresAt.toISOString(),
      tokenPreview: `${json.access_token.slice(0, 12)}…${json.access_token.slice(-6)}`,
    },
  );

  return NextResponse.json({
    ok: true,
    expiresAt: expiresAt.toISOString(),
    expiresInDays: Math.round(json.expires_in / 86400),
    accessToken: json.access_token,
  });
}

function authorized(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    // No secret configured = lock the route (better safe than open).
    console.warn("[ig/refresh] CRON_SECRET not set — refusing to run");
    return false;
  }
  const header = req.headers.get("authorization") ?? "";
  return header === `Bearer ${secret}`;
}
