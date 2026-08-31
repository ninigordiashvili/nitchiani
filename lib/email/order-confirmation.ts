import { sendEmail } from "./client";
import type { ManualOrderInput } from "@/lib/shopify/orders";

/**
 * Order confirmation email — fired right after the manual order is created (bank-transfer
 * and COD paths). For card payments the call lives in the BOG/TBC webhook so we only mail
 * after the gateway actually settles.
 *
 * Single template, bilingual via `locale`. Inline styles only — Gmail/Outlook/Apple Mail
 * all strip `<style>` blocks, so every visual rule needs to live on the element. Table-based
 * layout for the same reason: flexbox/grid don't render reliably in older mail clients.
 *
 * Tone matches the storefront: cream surface, ink text, maroon for accents/totals.
 */
export type OrderConfirmationInput = ManualOrderInput & {
  /** Display number used in the URL + subject — Shopify order name or local pseudo-id. */
  orderId: string;
};

const WHATSAPP_NUMBER =
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "995579370374";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
  "http://localhost:3000";

// Brand tokens — mirror the storefront's CSS variables but resolved to raw hex so they
// survive email-client style stripping.
const COLORS = {
  cream: "#f6f1e7",
  ink: "#0a1f1f",
  maroon: "#7a1c2d",
  silver: "#c8c0b3",
  hairline: "rgba(13, 13, 13, 0.08)",
} as const;

type Copy = {
  subject: string;
  preheader: string;
  greeting: string;
  intro: string;
  orderLabel: string;
  itemsLabel: string;
  subtotalLabel: string;
  discountLabel: string;
  shippingLabel: string;
  shippingNote: string;
  totalLabel: string;
  shippingHeader: string;
  paymentHeader: string;
  paymentByMethod: Record<ManualOrderInput["paymentMethod"], string>;
  nextHeader: string;
  steps: [string, string, string];
  trackCta: string;
  helpHeader: string;
  helpBody: string;
  whatsappCta: string;
  footer: string;
};

function copyFor(locale: string, firstName: string, orderId: string): Copy {
  if (locale.startsWith("ka")) {
    return {
      subject: `შეკვეთა დადასტურდა · #${orderId}`,
      preheader: `მადლობა, ${firstName}. შენი შეკვეთა მიღებულია — აი რა მოხდება შემდეგ.`,
      greeting: `მადლობა, ${firstName}.`,
      intro:
        "შენი შეკვეთა მიღებულია. რამდენიმე საათში დაგიკავშირდებით WhatsApp-ით ან ფოსტით — ქვემოთ შეგიძლია ნახო რა ნივთები ჩაიწერა.",
      orderLabel: "შეკვეთა",
      itemsLabel: "ნივთები",
      subtotalLabel: "ჯამი",
      discountLabel: "ფასდაკლება",
      shippingLabel: "მიწოდება",
      shippingNote: "გათვლა გადახდისას",
      totalLabel: "სრული თანხა",
      shippingHeader: "მიწოდების მისამართი",
      paymentHeader: "გადახდის მეთოდი",
      paymentByMethod: {
        bank_transfer: "ბანკის გადარიცხვა (ველოდებით დადასტურებას)",
        cod: "ნაღდი ფული მიწოდებისას",
        bog_card: "BOG ბარათი",
        tbc_card: "TBC ბარათი",
      },
      nextHeader: "რა მოხდება შემდეგ",
      steps: [
        "ჩვენ ვადასტურებთ შენს შეკვეთას WhatsApp-ით ან ფოსტით რამდენიმე საათში.",
        "შენი შეკვეთა ხელით მზადდება ჩვენს თბილისის სტუდიოში.",
        "კურიერი მოგიტანს 1-3 სამუშაო დღეში თბილისში.",
      ],
      trackCta: "შეკვეთის გადამოწმება",
      helpHeader: "გჭირდება დახმარება?",
      helpBody:
        "უპასუხე ამ ფოსტას ან მოგვწერე WhatsApp-ით — ჩვეულებრივ ერთ საათში ვუპასუხებთ.",
      whatsappCta: "WhatsApp-ით მოწერა",
      footer: "Nitchiani · ხელით ნაკეთი თბილისში",
    };
  }
  return {
    subject: `Order confirmed · #${orderId}`,
    preheader: `Thank you, ${firstName}. Your order is in — here's what happens next.`,
    greeting: `Thank you, ${firstName}.`,
    intro:
      "Your order is in. We'll confirm by WhatsApp or email within a few hours — the lines we received are below.",
    orderLabel: "Order",
    itemsLabel: "Items",
    subtotalLabel: "Subtotal",
    discountLabel: "Discount",
    shippingLabel: "Shipping",
    shippingNote: "Calculated at checkout",
    totalLabel: "Total",
    shippingHeader: "Shipping to",
    paymentHeader: "Payment",
    paymentByMethod: {
      bank_transfer: "Bank transfer (awaiting receipt)",
      cod: "Cash on delivery",
      bog_card: "BOG card",
      tbc_card: "TBC card",
    },
    nextHeader: "What happens next",
    steps: [
      "We confirm by WhatsApp or email within a few hours.",
      "Your order is hand-prepared at our Tbilisi studio.",
      "Courier delivers in 1–3 business days inside Tbilisi.",
    ],
    trackCta: "Track this order",
    helpHeader: "Need help?",
    helpBody:
      "Reply to this email or message us on WhatsApp — we usually answer within the hour.",
    whatsappCta: "Message on WhatsApp",
    footer: "Nitchiani · Hand-crafted in Tbilisi",
  };
}

function formatMoney(amount: string, currency: string): string {
  const n = Number.parseFloat(amount);
  if (!Number.isFinite(n)) return `${amount} ${currency}`;
  const symbol = currency === "GEL" ? "₾" : currency === "USD" ? "$" : `${currency} `;
  // Email-safe number formatting — no Intl shenanigans, just two-decimal toFixed.
  return `${symbol}${n.toFixed(2)}`;
}

function buildHtml(input: OrderConfirmationInput): string {
  const c = copyFor(input.locale, input.firstName, input.orderId);
  const trackUrl = `${SITE_URL}/${input.locale}/order-status?order=${encodeURIComponent(
    input.orderId,
  )}`;
  // Prefill the WhatsApp text in the customer's language so a Georgian buyer doesn't open
  // a chat already half-written in English.
  const waMessage = input.locale.startsWith("ka")
    ? `გამარჯობა — დაინტერესებული ვარ შეკვეთით ${input.orderId}`
    : `Hi — checking on order ${input.orderId}`;
  const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(waMessage)}`;

  const itemsRows = input.lines
    .map(
      (l) => `
      <tr>
        <td style="padding:12px 0;border-bottom:1px solid ${COLORS.hairline};vertical-align:top;">
          <div style="font-size:14px;color:${COLORS.ink};font-weight:500;line-height:1.3;">${escapeHtml(l.productTitle)}</div>
          <div style="font-size:12px;color:${COLORS.ink};opacity:0.6;margin-top:2px;">${escapeHtml(l.variantTitle)}</div>
          <div style="font-size:12px;color:${COLORS.ink};opacity:0.6;margin-top:2px;">× ${l.quantity}</div>
        </td>
        <td style="padding:12px 0;border-bottom:1px solid ${COLORS.hairline};vertical-align:top;text-align:right;font-size:14px;color:${COLORS.ink};white-space:nowrap;">
          ${formatMoney(
            (Number.parseFloat(l.unitPrice.amount) * l.quantity).toFixed(2),
            l.unitPrice.currencyCode,
          )}
        </td>
      </tr>`,
    )
    .join("");

  const stepsList = c.steps
    .map(
      (step, i) => `
        <tr>
          <td style="padding:6px 12px 6px 0;vertical-align:top;font-size:12px;color:${COLORS.maroon};font-weight:600;width:24px;">0${i + 1}</td>
          <td style="padding:6px 0;font-size:14px;color:${COLORS.ink};line-height:1.5;">${escapeHtml(step)}</td>
        </tr>`,
    )
    .join("");

  return `<!doctype html>
<html lang="${input.locale === "ka" ? "ka" : "en"}">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width" />
<title>${escapeHtml(c.subject)}</title>
</head>
<body style="margin:0;padding:0;background:${COLORS.cream};font-family:'Helvetica Neue',Arial,sans-serif;color:${COLORS.ink};">
  <span style="display:none;font-size:0;line-height:0;max-height:0;overflow:hidden;">${escapeHtml(c.preheader)}</span>
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:${COLORS.cream};padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:560px;background:${COLORS.cream};">
          <tr>
            <td style="padding-bottom:24px;">
              <div style="font-family:Georgia,'Times New Roman',serif;font-size:28px;letter-spacing:0.12em;color:${COLORS.ink};text-transform:uppercase;">Nitchiani</div>
            </td>
          </tr>
          <tr>
            <td style="padding:32px 24px;background:#ffffff;border:1px solid ${COLORS.hairline};">
              <p style="margin:0 0 4px;font-size:12px;letter-spacing:0.18em;text-transform:uppercase;color:${COLORS.silver};">${escapeHtml(c.orderLabel)} · #${escapeHtml(input.orderId)}</p>
              <h1 style="margin:0 0 16px;font-family:Georgia,'Times New Roman',serif;font-size:24px;line-height:1.15;color:${COLORS.ink};">${escapeHtml(c.greeting)}</h1>
              <p style="margin:0 0 24px;font-size:14px;line-height:1.55;color:${COLORS.ink};">${escapeHtml(c.intro)}</p>

              <p style="margin:24px 0 8px;font-size:12px;letter-spacing:0.18em;text-transform:uppercase;color:${COLORS.silver};">${escapeHtml(c.itemsLabel)}</p>
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:collapse;">
                ${itemsRows}
                <tr>
                  <td style="padding:12px 0 4px;font-size:14px;color:${COLORS.ink};opacity:0.8;">${escapeHtml(c.subtotalLabel)}</td>
                  <td style="padding:12px 0 4px;text-align:right;font-size:14px;color:${COLORS.ink};white-space:nowrap;">${formatMoney(input.subtotal.amount, input.subtotal.currencyCode)}</td>
                </tr>
                ${
                  input.discount && Number.parseFloat(input.discount.amount) > 0
                    ? `<tr>
                  <td style="padding:4px 0;font-size:14px;color:${COLORS.maroon};">${escapeHtml(c.discountLabel)}${input.couponCode ? ` · ${escapeHtml(input.couponCode)}` : ""}</td>
                  <td style="padding:4px 0;text-align:right;font-size:14px;color:${COLORS.maroon};white-space:nowrap;">−${formatMoney(input.discount.amount, input.discount.currencyCode)}</td>
                </tr>`
                    : ""
                }
                <tr>
                  <td style="padding:4px 0;font-size:14px;color:${COLORS.ink};opacity:0.8;">${escapeHtml(c.shippingLabel)}</td>
                  <td style="padding:4px 0;text-align:right;font-size:12px;color:${COLORS.ink};opacity:0.6;">${escapeHtml(c.shippingNote)}</td>
                </tr>
                <tr>
                  <td style="padding:12px 0 0;border-top:1px solid ${COLORS.hairline};font-size:14px;font-weight:600;color:${COLORS.ink};">${escapeHtml(c.totalLabel)}</td>
                  <td style="padding:12px 0 0;border-top:1px solid ${COLORS.hairline};text-align:right;font-size:16px;font-weight:600;color:${COLORS.maroon};white-space:nowrap;">${formatMoney((input.total ?? input.subtotal).amount, (input.total ?? input.subtotal).currencyCode)}</td>
                </tr>
              </table>

              <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin-top:32px;border-collapse:collapse;">
                <tr>
                  <td style="padding-right:16px;vertical-align:top;width:50%;">
                    <p style="margin:0 0 6px;font-size:12px;letter-spacing:0.18em;text-transform:uppercase;color:${COLORS.silver};">${escapeHtml(c.shippingHeader)}</p>
                    <p style="margin:0;font-size:14px;line-height:1.5;color:${COLORS.ink};">
                      ${escapeHtml(`${input.firstName} ${input.lastName}`.trim())}<br/>
                      ${escapeHtml(input.address)}<br/>
                      ${escapeHtml(input.city)}${input.postalCode ? `, ${escapeHtml(input.postalCode)}` : ""}<br/>
                      ${escapeHtml(input.phone)}
                    </p>
                  </td>
                  <td style="vertical-align:top;width:50%;">
                    <p style="margin:0 0 6px;font-size:12px;letter-spacing:0.18em;text-transform:uppercase;color:${COLORS.silver};">${escapeHtml(c.paymentHeader)}</p>
                    <p style="margin:0;font-size:14px;line-height:1.5;color:${COLORS.ink};">${escapeHtml(c.paymentByMethod[input.paymentMethod])}</p>
                  </td>
                </tr>
              </table>

              <p style="margin:32px 0 8px;font-size:12px;letter-spacing:0.18em;text-transform:uppercase;color:${COLORS.silver};">${escapeHtml(c.nextHeader)}</p>
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:collapse;">
                ${stepsList}
              </table>

              <table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:28px;">
                <tr>
                  <td style="background:${COLORS.ink};">
                    <a href="${trackUrl}" style="display:inline-block;padding:12px 22px;font-size:12px;letter-spacing:0.18em;text-transform:uppercase;color:${COLORS.cream};text-decoration:none;font-weight:500;">${escapeHtml(c.trackCta)}</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 24px 0;">
              <p style="margin:0 0 4px;font-size:12px;letter-spacing:0.18em;text-transform:uppercase;color:${COLORS.silver};">${escapeHtml(c.helpHeader)}</p>
              <p style="margin:0 0 12px;font-size:13px;line-height:1.55;color:${COLORS.ink};opacity:0.8;">${escapeHtml(c.helpBody)}</p>
              <a href="${waUrl}" style="font-size:13px;color:${COLORS.maroon};text-decoration:underline;">${escapeHtml(c.whatsappCta)}</a>
            </td>
          </tr>
          <tr>
            <td style="padding:32px 24px 0;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:${COLORS.silver};">
              ${escapeHtml(c.footer)}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function buildText(input: OrderConfirmationInput): string {
  const c = copyFor(input.locale, input.firstName, input.orderId);
  const trackUrl = `${SITE_URL}/${input.locale}/order-status?order=${encodeURIComponent(
    input.orderId,
  )}`;
  const lines = input.lines
    .map(
      (l) =>
        `  - ${l.productTitle} (${l.variantTitle}) × ${l.quantity} — ${formatMoney(
          (Number.parseFloat(l.unitPrice.amount) * l.quantity).toFixed(2),
          l.unitPrice.currencyCode,
        )}`,
    )
    .join("\n");

  return [
    `${c.orderLabel} #${input.orderId}`,
    "",
    c.greeting,
    "",
    c.intro,
    "",
    `${c.itemsLabel}:`,
    lines,
    "",
    `${c.subtotalLabel}: ${formatMoney(input.subtotal.amount, input.subtotal.currencyCode)}`,
    ...(input.discount && Number.parseFloat(input.discount.amount) > 0
      ? [
          `${c.discountLabel}${input.couponCode ? ` (${input.couponCode})` : ""}: −${formatMoney(input.discount.amount, input.discount.currencyCode)}`,
        ]
      : []),
    `${c.totalLabel}: ${formatMoney((input.total ?? input.subtotal).amount, (input.total ?? input.subtotal).currencyCode)}`,
    `${c.paymentHeader}: ${c.paymentByMethod[input.paymentMethod]}`,
    "",
    `${c.shippingHeader}:`,
    `${input.firstName} ${input.lastName}`.trim(),
    input.address,
    `${input.city}${input.postalCode ? `, ${input.postalCode}` : ""}`,
    input.phone,
    "",
    `${c.nextHeader}:`,
    ...c.steps.map((s, i) => `  0${i + 1}. ${s}`),
    "",
    `${c.trackCta}: ${trackUrl}`,
    "",
    c.footer,
  ].join("\n");
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function sendOrderConfirmation(input: OrderConfirmationInput): Promise<boolean> {
  // Email is optional at checkout — a customer can order with just a name and a phone
  // number. Nothing to send to, and no error either: the studio still follows up on
  // WhatsApp, which is what the confirmation copy itself promises.
  if (!input.email) {
    console.warn("[email/order-confirmation] no email on order — skipping", input.orderId);
    return false;
  }

  const c = copyFor(input.locale, input.firstName, input.orderId);
  return sendEmail({
    to: input.email,
    subject: c.subject,
    html: buildHtml(input),
    text: buildText(input),
  });
}
