import { NextResponse } from "next/server";
import { z } from "zod";
import { addNewsletterContact } from "@/lib/email/newsletter";
import { clientIp, rateLimit } from "@/lib/rate-limit";

/**
 * Newsletter subscription endpoint. Posts the supplied email to Resend's audiences API and
 * normalises the response into a small payload the footer form understands:
 *   { ok: true, status: "added" | "already" }     — show the success state
 *   { ok: false, error: "<message or key>" }      — show inline error
 *
 * Consent is implicit in the form submission — the form ships visible disclosure copy
 * (see `footer.newsletterConsent` translation) immediately above the submit button.
 */

const schema = z.object({
  email: z.string().email(),
  locale: z.enum(["en", "ka"]).optional(),
});

export async function POST(req: Request) {
  // Throttle to curb signup spam, email enumeration and Resend-quota abuse.
  const rl = rateLimit(`newsletter:${clientIp(req)}`, { limit: 5, windowMs: 60_000 });
  if (!rl.ok) {
    return NextResponse.json(
      { ok: false, error: "Too many requests. Please wait a moment and try again." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfter) } },
    );
  }

  let payload: z.infer<typeof schema>;
  try {
    payload = schema.parse(await req.json());
  } catch (err) {
    // A stable key, not the zod dump: `err.message` is the whole validation tree serialised
    // as JSON, which told any caller our schema and told a person nothing. The footer form
    // shows its own translated message and never read this text anyway.
    console.warn("[api/newsletter] payload rejected:", err);
    return NextResponse.json({ ok: false, error: "invalidEmail" }, { status: 400 });
  }

  const result = await addNewsletterContact({
    email: payload.email,
    locale: payload.locale,
  });

  if (!result.ok) {
    return NextResponse.json(
      { ok: false, error: "Subscription failed. Please try again or message us." },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true, status: result.status });
}
