/**
 * Newsletter subscription via Resend's Audiences API. Reuses the same Resend API key the
 * transactional emails are configured with, so there's no second provider to onboard.
 *
 * Required env (in addition to the transactional setup):
 *   RESEND_API_KEY        — same key used by `lib/email/client.ts`
 *   RESEND_AUDIENCE_ID    — audience UUID from https://resend.com/audiences
 *
 * When either is missing the function logs a warning and returns false, so dev/local works
 * without surprising the rest of the app.
 */

type AddContactArgs = {
  email: string;
  /** Stored as `first_name` on the Resend contact — useful for personalised broadcasts. */
  firstName?: string;
  /** Free-form, used by us to filter by language when sending later. */
  locale?: "en" | "ka";
};

type AddContactResult = {
  ok: boolean;
  /** "already" = the email was already subscribed; "added" = newly added; "error" otherwise. */
  status: "added" | "already" | "error";
};

export async function addNewsletterContact({
  email,
  firstName,
  locale,
}: AddContactArgs): Promise<AddContactResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const audienceId = process.env.RESEND_AUDIENCE_ID;

  if (!apiKey || !audienceId) {
    console.warn(
      "[email/newsletter] RESEND_API_KEY or RESEND_AUDIENCE_ID not set — newsletter subscription skipped for",
      email,
    );
    return { ok: false, status: "error" };
  }

  try {
    const res = await fetch(
      `https://api.resend.com/audiences/${audienceId}/contacts`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          first_name: firstName,
          unsubscribed: false,
          // Resend doesn't have a first-class "locale" field but we tack it on as a tag-
          // adjacent string we can filter on at broadcast time via the dashboard.
          ...(locale ? { last_name: `[${locale}]` } : {}),
        }),
      },
    );

    if (res.status === 201 || res.status === 200) {
      return { ok: true, status: "added" };
    }

    // Resend returns 409 / 422 for duplicate contacts depending on the endpoint version.
    // Both are non-errors for our purposes — the user is already subscribed.
    if (res.status === 409 || res.status === 422) {
      return { ok: true, status: "already" };
    }

    const detail = await res.text().catch(() => "");
    console.error("[email/newsletter] Resend rejected contact", res.status, detail);
    return { ok: false, status: "error" };
  } catch (err) {
    console.error("[email/newsletter] Resend request threw", err);
    return { ok: false, status: "error" };
  }
}
