/**
 * Thin wrapper around the Resend HTTP API. We call the API directly via `fetch` instead
 * of pulling in the `resend` SDK — keeps the dependency footprint zero and makes the call
 * site obvious. Resend was chosen over Brevo/Postmark because (a) free tier of 3k/month
 * covers launch volume, (b) the HTTP surface is one POST endpoint, (c) no domain-warmup
 * dance for the first send.
 *
 * Required env:
 *   RESEND_API_KEY        — Resend API key (https://resend.com/api-keys)
 *   EMAIL_FROM            — verified sender, e.g. "Nitchiani <orders@nitchiani.shop>"
 * Optional:
 *   EMAIL_STUDIO_BCC      — BCC address for the studio (collect order notifications)
 *
 * If `RESEND_API_KEY` is missing the function logs and returns false instead of throwing —
 * dev/local environments without an API key still work, the email just doesn't send.
 */

type SendArgs = {
  to: string;
  subject: string;
  html: string;
  /** Plain-text fallback for clients that don't render HTML. */
  text: string;
  /** Override BCC for a single send. Default reads `EMAIL_STUDIO_BCC`. */
  bcc?: string | string[];
  /** Optional reply-to. Defaults to omitted (replies go to From). */
  replyTo?: string;
};

export async function sendEmail({ to, subject, html, text, bcc, replyTo }: SendArgs): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;

  if (!apiKey || !from) {
    console.warn("[email] RESEND_API_KEY or EMAIL_FROM not set — skipping send to", to);
    return false;
  }

  const finalBcc = bcc ?? process.env.EMAIL_STUDIO_BCC;

  const body = {
    from,
    to,
    subject,
    html,
    text,
    ...(finalBcc ? { bcc: finalBcc } : {}),
    ...(replyTo ? { reply_to: replyTo } : {}),
  };

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.error("[email] Resend rejected send", res.status, detail);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[email] Resend request threw", err);
    return false;
  }
}
