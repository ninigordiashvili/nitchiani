import { NextResponse } from "next/server";

/**
 * Refreshes the long-lived Instagram access token.
 *
 * Triggered by Vercel cron (see vercel.json) on the 1st of every month at 03:00 UTC, ~30 days
 * before the current 60-day token expires. Vercel cron sends `Authorization: Bearer ${CRON_SECRET}`,
 * which we verify here.
 *
 * The route returns the new token in the response body and logs it. Because Vercel env vars
 * cannot be mutated from runtime code, you (or a downstream service) must update INSTAGRAM_ACCESS_TOKEN
 * with the new value. Common patterns:
 *   - Read the new token from Vercel logs and update the env var manually
 *   - Hook this route up to a Slack/Telegram webhook for notification
 *   - Move token storage to Vercel KV / Edge Config (mutable) and read from there in lib/instagram.ts
 *
 * Manual trigger for testing: curl -H "Authorization: Bearer $CRON_SECRET" https://yourdomain/api/instagram/refresh-token
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
