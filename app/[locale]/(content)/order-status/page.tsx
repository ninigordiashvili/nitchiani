import type { Metadata } from "next";
import { Check, ClipboardCheck, ExternalLink, Package, RotateCcw, Truck } from "lucide-react";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { WhatsAppIcon, getWhatsAppNumber } from "@/components/brand/WhatsAppIcon";
import { getOrderByName, type OrderTracking } from "@/lib/shopify/orders";
import { getTrackingByToken } from "@/lib/echodesk/tracking";
import { localeAlternates } from "@/lib/seo";
import type { Locale } from "@/lib/i18n/config";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const title = locale === "ka" ? "შეკვეთის სტატუსი" : "Order status";
  const description =
    locale === "ka"
      ? "თვალი ადევნეთ თქვენს Nitchiani შეკვეთას — გადახდიდან მიწოდებამდე."
      : "Track your Nitchiani order — from payment confirmation to delivery.";
  return {
    title,
    description,
    alternates: localeAlternates(locale, "/order-status"),
  };
}

/**
 * Order tracking page. Two render paths:
 *
 *   1. Static explainer — when there's no `?order=X` query or Shopify Admin isn't
 *      configured (local/dev), shows the same trust-anchor timeline + WhatsApp CTA
 *      this page has always had.
 *
 *   2. Live tracking — when the order resolves via `getOrderByName`, shows the
 *      derived current step (1-of-4 highlighted), the actual line items, and the
 *      carrier + tracking number + tracking URL when the fulfillment has them.
 *
 * The 4-step model matches the "How it works" modal vocabulary, so a buyer who saw
 * that on the PDP recognises the timeline here. Steps:
 *   01 Order placed → 02 Payment confirmed → 03 Hand-prepared in Tbilisi → 04 On its way
 */
export default async function OrderStatusPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<{ order?: string; token?: string }>;
}) {
  const { locale } = await params;
  const { order: orderParam, token: tokenParam } = await searchParams;
  setRequestLocale(locale);

  const [t, tCart, tCheckout, tWa] = await Promise.all([
    getTranslations("orderStatus"),
    getTranslations("cart"),
    getTranslations("checkout"),
    getTranslations("whatsapp"),
  ]);

  const whatsappNumber = getWhatsAppNumber();

  // Two ways in, in order of reliability:
  //   1. `?token=` — the order's public_token, from the confirmation email. Works without an
  //      account and is the link we hand the customer at checkout.
  //   2. `?order=` — legacy Shopify order-name lookup, kept so older links don't break.
  //
  // A pasted value could be either, so a token lookup is tried first and the name lookup is
  // the fallback; a wrong guess costs one request, not a dead end.
  const lookup = tokenParam ?? orderParam;
  const order =
    (lookup ? await getTrackingByToken(lookup, locale).catch(() => null) : null) ??
    (orderParam ? await getOrderByName(orderParam).catch(() => null) : null);

  const message = orderParam
    ? tWa("orderMessage", { id: orderParam })
    : tWa("orderMessageGeneric");
  const whatsappHref = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

  return (
    <div className="container-shop pb-8 sm:pb-12">
      <header className="mb-8 max-w-2xl">
        <p className="label-eyebrow mb-2">{t("eyebrow")}</p>
        {order ? (
          <p className="mb-3 text-xs tabular-nums opacity-60">
            {tCheckout("orderNumber", { id: order.name })}
          </p>
        ) : null}
        <h1 className="font-display text-3xl leading-tight tracking-tight sm:text-4xl">
          {order ? t("liveTitle") : t("title")}
        </h1>
        <p className="mt-4 text-sm opacity-80 sm:text-base">
          {order ? t("liveIntro") : t("intro")}
        </p>
      </header>

      {order ? (
        <LiveTracking order={order} locale={locale} />
      ) : (
        <>
          {/* A number was supplied but nothing came back — say so plainly. Falling through to
              the generic timeline would leave the customer thinking the page had ignored them. */}
          {lookup ? (
            <div
              role="status"
              className="mb-8 rounded-lg border p-5"
              style={{ borderColor: "var(--border-soft)", background: "var(--surface-2, transparent)" }}
            >
              <p className="font-display text-lg tracking-tight">{t("notFoundTitle")}</p>
              <p className="mt-2 max-w-md text-sm opacity-75">{t("notFoundDesc")}</p>
            </div>
          ) : null}

          <OrderLookup t={t} defaultValue={lookup} />
          <StaticTimeline tCart={tCart} />
        </>
      )}

      <div className="rounded-lg border border-black/10 p-5 sm:p-6">
        <p className="label-eyebrow mb-2">{t("contactEyebrow")}</p>
        <p className="font-display text-xl tracking-tight sm:text-2xl">{t("contactTitle")}</p>
        <p className="mt-2 max-w-md text-sm opacity-75">{t("contactDesc")}</p>
        <a
          href={whatsappHref}
          target="_blank"
          rel="noreferrer noopener"
          className="btn-primary mt-5"
        >
          <WhatsAppIcon size={16} />
          {t("openWhatsApp")}
        </a>
      </div>
    </div>
  );
}

/** Static 4-step explainer — the page's original behaviour, kept as a fallback. */
function StaticTimeline({
  tCart,
}: {
  tCart: Awaited<ReturnType<typeof getTranslations<"cart">>>;
}) {
  const steps = [
    { icon: ClipboardCheck, text: tCart("howItWorksStep1Title") },
    { icon: Package, text: tCart("howItWorksStep2Title") },
    { icon: Truck, text: tCart("howItWorksStep3Title") },
    { icon: RotateCcw, text: tCart("howItWorksStep4Title") },
  ];
  return (
    <ol className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {steps.map((step, i) => (
        <li
          key={i}
          className="flex items-start gap-3 rounded-md border border-black/10 p-4"
        >
          <span
            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full"
            style={{
              background: "color-mix(in oklab, var(--color-brand-maroon) 10%, transparent)",
              color: "var(--color-brand-maroon)",
            }}
          >
            <step.icon size={16} />
          </span>
          <div>
            <p className="text-[11px] tabular-nums opacity-50">0{i + 1}</p>
            <p className="text-sm font-medium leading-tight">{step.text}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

/** Real-order timeline — current step highlighted, completed steps checked, future steps muted. */
async function LiveTracking({
  order,
  locale,
}: {
  order: OrderTracking;
  locale: Locale;
}) {
  const t = await getTranslations("orderStatus");

  const stepCopy = [
    t("step1"),
    t("step2"),
    t("step3"),
    t("step4"),
  ];

  const placedAt = order.createdAt
    ? new Intl.DateTimeFormat(locale === "ka" ? "ka-GE" : "en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(new Date(order.createdAt))
    : null;

  return (
    <div className="mb-10 space-y-8">
      {/* Step timeline */}
      <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {stepCopy.map((label, idx) => {
          const stepNumber = (idx + 1) as 1 | 2 | 3 | 4;
          const completed = stepNumber < order.step;
          const current = stepNumber === order.step;
          return (
            <li
              key={idx}
              aria-current={current ? "step" : undefined}
              className={`flex items-start gap-3 rounded-md border p-4 transition-colors ${
                current
                  ? "border-[var(--color-brand-maroon)]"
                  : completed
                    ? "border-black/15"
                    : "border-black/10 opacity-60"
              }`}
            >
              <span
                className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-xs font-medium tabular-nums"
                style={{
                  background:
                    completed || current
                      ? "color-mix(in oklab, var(--color-brand-maroon) 10%, transparent)"
                      : "color-mix(in oklab, var(--color-brand-ink) 5%, transparent)",
                  color:
                    completed || current
                      ? "var(--color-brand-maroon)"
                      : "var(--color-brand-ink)",
                }}
              >
                {completed ? <Check size={16} /> : `0${stepNumber}`}
              </span>
              {/* The number already sits in the badge to the left — repeating it above the
                  label rendered every step twice ("01 / 01 Order placed"). */}
              <p className="self-center text-sm font-medium leading-tight">{label}</p>
            </li>
          );
        })}
      </ol>

      {/* Tracking number + carrier — only when fulfillment has it */}
      {order.tracking?.number ? (
        <div className="rounded-md border border-black/10 p-4 sm:p-5">
          <p className="label-eyebrow mb-2">{t("trackingLabel")}</p>
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 text-sm">
            {order.tracking.company ? (
              <span className="font-medium">{order.tracking.company}</span>
            ) : null}
            <span className="font-mono tabular-nums opacity-90">{order.tracking.number}</span>
          </div>
          {order.tracking.url ? (
            <a
              href={order.tracking.url}
              target="_blank"
              rel="noreferrer noopener"
              className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium tracking-[0.16em] uppercase opacity-80 hover:opacity-100"
            >
              {t("trackingCta")}
              <ExternalLink size={12} />
            </a>
          ) : null}
        </div>
      ) : null}

      {/* Order summary: items + placement date */}
      <div className="rounded-md border border-black/10 p-4 sm:p-5">
        <div className="mb-3 flex items-baseline justify-between gap-3">
          <p className="label-eyebrow">{t("orderItems")}</p>
          {placedAt ? (
            <p className="text-[11px] tabular-nums opacity-60">{placedAt}</p>
          ) : null}
        </div>
        <ul className="space-y-2 text-sm">
          {order.lines.map((line, i) => (
            <li key={i} className="flex items-baseline justify-between gap-3">
              <span className="min-w-0 truncate">
                {line.title}
                {line.variantTitle ? (
                  <span className="opacity-60"> · {line.variantTitle}</span>
                ) : null}
              </span>
              <span className="flex-shrink-0 tabular-nums opacity-70">× {line.quantity}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/**
 * Order-number lookup. A plain GET form submitting to this same route, so it works without
 * JavaScript and leaves a shareable/bookmarkable `?order=` URL — which is also the link the
 * confirmation email points at.
 *
 * Deliberately not behind an account: the order number is the credential. `getOrderByName`
 * matches an exact name, so there is nothing to enumerate usefully, and the response exposes
 * only fulfilment state — no address, no contact details, no payment data.
 */
function OrderLookup({
  t,
  defaultValue,
}: {
  t: Awaited<ReturnType<typeof getTranslations<"orderStatus">>>;
  defaultValue?: string;
}) {
  return (
    <form
      method="get"
      className="mb-10 rounded-lg border p-5 sm:p-6"
      style={{ borderColor: "var(--border-soft)" }}
    >
      <label htmlFor="order-lookup" className="label-eyebrow mb-2 block">
        {t("lookupLabel")}
      </label>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          id="order-lookup"
          name="token"
          type="text"
          autoComplete="off"
          required
          defaultValue={defaultValue ?? ""}
          placeholder={t("lookupPlaceholder")}
          className="w-full rounded-md border px-3 py-2.5 text-base outline-none focus:border-[var(--color-brand-ink)]"
          style={{ borderColor: "var(--border-soft)", background: "var(--surface)" }}
        />
        <button type="submit" className="btn-primary shrink-0 justify-center">
          {t("lookupCta")}
        </button>
      </div>
      <p className="mt-2 text-xs opacity-60">{t("lookupHint")}</p>
    </form>
  );
}
