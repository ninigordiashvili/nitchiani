import { CheckCircle2, AlertTriangle } from "lucide-react";

/**
 * Landing page for the Instagram OAuth redirect.
 *
 * Meta sends the user here as `?code=AQ...` (success) or `?error=...&error_description=...` (denial).
 * This page just displays the code so it can be copy-pasted into `npm run ig:exchange -- <code>`.
 * It is intentionally not localized — the OAuth redirect URI must be a fixed URL registered in
 * the Meta app dashboard.
 */
export default async function InstagramOAuthCallback({
  searchParams,
}: {
  searchParams: Promise<{ code?: string; error?: string; error_description?: string }>;
}) {
  const { code, error, error_description } = await searchParams;

  if (error) {
    return (
      <Shell>
        <div
          className="flex items-start gap-3 rounded-md p-4"
          style={{ background: "#fef2f2", color: "#7f1d1d" }}
        >
          <AlertTriangle size={20} className="flex-shrink-0" />
          <div>
            <p className="font-medium">Authorization denied</p>
            <p className="mt-1 text-sm opacity-80">
              {error}: {error_description ?? "no description"}
            </p>
          </div>
        </div>
      </Shell>
    );
  }

  if (!code) {
    return (
      <Shell>
        <p className="text-sm opacity-70">
          Open this page from the Instagram OAuth flow — it expects a <code>?code=…</code> query param.
        </p>
      </Shell>
    );
  }

  const command = `npm run ig:exchange -- ${code}`;

  return (
    <Shell>
      <div className="flex items-start gap-3 rounded-md p-4" style={{ background: "#ecfdf5", color: "#064e3b" }}>
        <CheckCircle2 size={20} className="flex-shrink-0" />
        <div>
          <p className="font-medium">Authorization code received</p>
          <p className="mt-1 text-sm opacity-80">
            Run the command below in your terminal to exchange it for a 60-day long-lived token.
          </p>
        </div>
      </div>

      <div className="mt-6">
        <p className="label-eyebrow mb-2">Run in terminal</p>
        <pre className="overflow-x-auto rounded-md bg-[var(--color-brand-bg)] p-4 text-xs text-[var(--color-brand-cream)]">
          <code>{command}</code>
        </pre>
      </div>

      <div className="mt-6">
        <p className="label-eyebrow mb-2">Code (one-time use, expires in ~10 min)</p>
        <pre className="overflow-x-auto rounded-md border border-black/10 bg-white p-4 text-xs">
          <code>{code}</code>
        </pre>
      </div>

      <p className="mt-6 text-xs opacity-60">
        Tip: codes are single-use. If the exchange fails, run <code>npm run ig:authorize-url</code> again
        and re-authorize.
      </p>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto max-w-xl px-4 py-12">
      <h1 className="font-display mb-2 text-2xl tracking-tight">Instagram authorization</h1>
      <p className="mb-6 text-sm opacity-70">Step 7 of the Instagram setup walkthrough.</p>
      {children}
    </main>
  );
}
