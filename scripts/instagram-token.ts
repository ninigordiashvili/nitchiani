#!/usr/bin/env node
/**
 * Instagram access-token helper.
 *
 * Three subcommands, mapping to the Instagram API with Instagram Login OAuth flow:
 *
 *   1. authorize-url
 *      Prints the OAuth URL to open in a browser. Set IG_CLIENT_ID + IG_REDIRECT_URI in your env.
 *
 *   2. exchange <code>
 *      Exchanges the ?code=... value Meta returns to your redirect URI for a short-lived
 *      token, then immediately exchanges it for a 60-day long-lived token.
 *      Set IG_CLIENT_ID + IG_CLIENT_SECRET + IG_REDIRECT_URI in your env.
 *
 *   3. refresh
 *      Refreshes a long-lived token (extends another 60 days). Pass the existing token via
 *      INSTAGRAM_ACCESS_TOKEN env var. Run monthly from cron / Vercel cron.
 *
 * Run with: npx tsx scripts/instagram-token.ts <subcommand>  (or via npm scripts below)
 */

const SUBCOMMAND = process.argv[2];

async function main() {
  switch (SUBCOMMAND) {
    case "authorize-url":
      return printAuthorizeUrl();
    case "exchange":
      return exchangeCode(process.argv[3]);
    case "refresh":
      return refreshToken();
    default:
      console.log(USAGE);
      process.exit(1);
  }
}

const USAGE = `Usage:
  npm run ig:authorize-url
  npm run ig:exchange <code-from-redirect-url>
  npm run ig:refresh

Required env vars:
  IG_CLIENT_ID           Meta app's Instagram client ID
  IG_CLIENT_SECRET       Meta app's Instagram client secret
  IG_REDIRECT_URI        Same value you registered in the Meta app dashboard
  INSTAGRAM_ACCESS_TOKEN (only for refresh) — the current long-lived token`;

function printAuthorizeUrl() {
  const clientId = req("IG_CLIENT_ID");
  const redirectUri = req("IG_REDIRECT_URI");
  const url = new URL("https://api.instagram.com/oauth/authorize");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("scope", "instagram_business_basic");
  url.searchParams.set("response_type", "code");
  console.log(url.toString());
}

async function exchangeCode(code: string | undefined) {
  if (!code) fail("Missing code argument. Pass the value of ?code=... from the redirect URL.");

  const clientId = req("IG_CLIENT_ID");
  const clientSecret = req("IG_CLIENT_SECRET");
  const redirectUri = req("IG_REDIRECT_URI");

  // Step 1: code → short-lived token
  const shortRes = await fetch("https://api.instagram.com/oauth/access_token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "authorization_code",
      redirect_uri: redirectUri,
      code: code!,
    }).toString(),
  });
  if (!shortRes.ok) fail(`short-token exchange failed: ${shortRes.status} ${await shortRes.text()}`);
  const shortJson = (await shortRes.json()) as { access_token: string; user_id: number };

  // Step 2: short → long-lived token (60 days)
  const longUrl = new URL("https://graph.instagram.com/access_token");
  longUrl.searchParams.set("grant_type", "ig_exchange_token");
  longUrl.searchParams.set("client_secret", clientSecret);
  longUrl.searchParams.set("access_token", shortJson.access_token);

  const longRes = await fetch(longUrl);
  if (!longRes.ok) fail(`long-token exchange failed: ${longRes.status} ${await longRes.text()}`);
  const longJson = (await longRes.json()) as { access_token: string; token_type: string; expires_in: number };

  printToken(longJson.access_token, longJson.expires_in);
}

async function refreshToken() {
  const token = req("INSTAGRAM_ACCESS_TOKEN");
  const url = new URL("https://graph.instagram.com/refresh_access_token");
  url.searchParams.set("grant_type", "ig_refresh_token");
  url.searchParams.set("access_token", token);

  const res = await fetch(url);
  if (!res.ok) fail(`refresh failed: ${res.status} ${await res.text()}`);
  const json = (await res.json()) as { access_token: string; expires_in: number };

  printToken(json.access_token, json.expires_in);
}

function printToken(token: string, expiresInSeconds: number) {
  const expiresAt = new Date(Date.now() + expiresInSeconds * 1000);
  console.log("\n  ✓ Token issued");
  console.log(`  Expires:  ${expiresAt.toISOString()}  (${Math.round(expiresInSeconds / 86400)} days)`);
  console.log(`\n  Add this to .env.local:\n`);
  console.log(`  INSTAGRAM_ACCESS_TOKEN="${token}"\n`);
}

function req(name: string): string {
  const v = process.env[name];
  if (!v) fail(`Missing required env var: ${name}\n\n${USAGE}`);
  return v!;
}

function fail(msg: string): never {
  console.error(`✗ ${msg}`);
  process.exit(1);
}

main().catch((err) => {
  console.error("✗ unexpected error:", err);
  process.exit(1);
});
