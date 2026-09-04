import { NextResponse } from "next/server";
import { z } from "zod";
import {
  computeTotals,
  computeTotalsWithEchoDesk,
  type ServerComputedTotals,
} from "@/lib/checkout/totals";
import { sendOrderConfirmation } from "@/lib/email/order-confirmation";
import {
  createManualOrder,
  createPendingOrder,
  type ManualOrderInput,
} from "@/lib/shopify/orders";
import { createBogPaymentOrder, isBogConfigured } from "@/lib/payments/bog";
import { createTbcPayment, getClientIp, isTbcConfigured } from "@/lib/payments/tbc";
import {
  createGuestOrder,
  type GuestOrderOutcome,
  toEchoDeskPaymentMethod,
} from "@/lib/echodesk/orders";
import { isEchoDeskConfigured } from "@/lib/echodesk/client";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { reportError } from "@/lib/observability";

const lineSchema = z.object({
  variantId: z.string(),
  productHandle: z.string(),
  productTitle: z.string(),
  variantTitle: z.string(),
  unitPrice: z.object({ amount: z.string(), currencyCode: z.string() }),
  quantity: z.number().int().positive(),
});

// Mirrors NEXT_PUBLIC_COD_ENABLED on the checkout page. The client hides the option; this
// is what actually refuses it, so a hand-rolled request can't book a cash-on-delivery order
// while the service is withdrawn.
const COD_ENABLED = process.env.NEXT_PUBLIC_COD_ENABLED === "true";

const bodySchema = z.object({
  firstName: z.string().min(1),
  // Required for the same reason as the client schema: the backend refuses without it.
  lastName: z.string().min(1),
  phone: z.string().min(6),
  email: z.string().email().optional().or(z.literal("")),
  address: z.string().min(3),
  city: z.string().min(1),
  postalCode: z.string().optional(),
  // Latitude/longitude from the address picker. Bounded to real coordinates so a malformed
  // client can't push nonsense into the courier's map link.
  lat: z.number().min(-90).max(90).optional(),
  lng: z.number().min(-180).max(180).optional(),
  notes: z.string().optional(),
  paymentMethod: z.enum(["bank_transfer", "cod", "bog_card", "tbc_card"]),
  locale: z.string(),
  lines: z.array(lineSchema).min(1),
  /** Client-supplied subtotal — used only for cross-check against the server-recomputed value. */
  subtotal: z.object({ amount: z.string(), currencyCode: z.string() }),
  /** Optional coupon. Server re-validates against the coupon registry; client `discount` is ignored. */
  couponCode: z.string().nullable().optional(),
});

/**
 * Errors are returned as stable keys, not sentences. The client translates them, so a
 * Georgian shopper gets Georgian — and the wording can change without touching the API.
 */
function classifyOrderError(message: string): string {
  if (/cash on delivery|pickup/i.test(message)) return "codPickupOnly";
  if (/promo|coupon/i.test(message)) return "promoInvalid";
  if (/stock|unavailable|quantity/i.test(message)) return "outOfStock";
  if (/required|missing/i.test(message)) return "missingDetails";
  console.warn("[api/checkout/initiate] unclassified backend error:", message);
  return "orderFailed";
}

type CheckoutResponse =
  | { orderId: string; trackingToken?: string }
  | { redirectUrl: string }
  | {
      error: string;
      /** Present only for an over-limit line, so the client can name the product and the
       *  number left instead of showing the catch-all message. */
      stock?: { product: string; available: number };
    };

/** Build the order-creation payload the way `createManualOrder` / `createPendingOrder` expect. */
function buildOrderInput(
  payload: z.infer<typeof bodySchema>,
  totals: ServerComputedTotals,
): ManualOrderInput {
  return {
    firstName: payload.firstName,
    lastName: payload.lastName,
    phone: payload.phone,
    email: payload.email ?? "",
    address: payload.address,
    city: payload.city,
    lat: payload.lat,
    lng: payload.lng,
    postalCode: payload.postalCode,
    notes: payload.notes,
    paymentMethod: payload.paymentMethod,
    locale: payload.locale,
    lines: payload.lines,
    subtotal: { amount: totals.subtotal.toFixed(2), currencyCode: payload.subtotal.currencyCode },
    discount:
      totals.discount > 0
        ? { amount: totals.discount.toFixed(2), currencyCode: payload.subtotal.currencyCode }
        : undefined,
    total: { amount: totals.total.toFixed(2), currencyCode: payload.subtotal.currencyCode },
    couponCode: totals.coupon?.code,
  };
}

export async function POST(req: Request): Promise<NextResponse<CheckoutResponse>> {
  // Rate limit BEFORE any work — this endpoint creates real Shopify orders, so an unthrottled
  // caller could flood the admin with junk. 8 orders/minute/IP is generous for a real shopper
  // (including payment retries) but caps automated abuse.
  const rl = rateLimit(`checkout:${clientIp(req)}`, { limit: 8, windowMs: 60_000 });
  if (!rl.ok) {
    return NextResponse.json(
      { error: "rateLimited" },
      { status: 429, headers: { "Retry-After": String(rl.retryAfter) } },
    );
  }

  let payload: z.infer<typeof bodySchema>;
  try {
    payload = bodySchema.parse(await req.json());
  } catch (err) {
    // A zod dump is neither translatable nor readable; the client form validates first, so
    // reaching here means a hand-rolled request.
    console.warn("[api/checkout/initiate] payload rejected:", err);
    return NextResponse.json({ error: "invalidRequest" }, { status: 400 });
  }

  if (payload.paymentMethod === "cod" && !COD_ENABLED) {
    return NextResponse.json(
      { error: "codUnavailable" },
      { status: 400 },
    );
  }

  // Server-side total computation. Recompute subtotal from the line items and validate the
  // coupon against the registry — never trust the client's `subtotal` / `discount` numbers.
  // When EchoDesk owns the order it also owns the discount — see computeTotalsWithEchoDesk.
  const totalsResult = isEchoDeskConfigured
    ? await computeTotalsWithEchoDesk(payload.lines, payload.couponCode)
    : computeTotals(payload.lines, payload.couponCode);
  if (!totalsResult.ok) {
    return NextResponse.json({ error: totalsResult.error }, { status: 400 });
  }
  const totals = totalsResult.totals;

  // Cross-check the client's subtotal against ours — a small drift means catalog prices
  // changed since the cart was loaded, which is worth surfacing so the user can re-confirm.
  // Tolerance of 0.01 GEL absorbs floating-point rounding without letting real mismatches slip.
  const clientSubtotal = Number.parseFloat(payload.subtotal.amount);
  if (!Number.isFinite(clientSubtotal) || Math.abs(clientSubtotal - totals.subtotal) > 0.01) {
    console.warn(
      "[api/checkout/initiate] subtotal mismatch — client:",
      clientSubtotal,
      "server:",
      totals.subtotal,
    );
    return NextResponse.json(
      { error: "cartChanged" },
      { status: 409 },
    );
  }

  const orderInput = buildOrderInput(payload, totals);

  // EchoDesk owns orders once it's configured. It brokers card payments itself, so the
  // BOG/TBC branches below are bypassed entirely — the tenant decides which providers are
  // live and hands back a `payment_url` when one applies.
  if (isEchoDeskConfigured) {
    return handleEchoDeskOrder(orderInput, totals);
  }

  if (payload.paymentMethod === "bog_card") {
    return handleBogCard(orderInput, totals, req);
  }
  if (payload.paymentMethod === "tbc_card") {
    return handleTbcCard(orderInput, totals, req);
  }

  // bank_transfer / cod — manual flow, order created in pending state, customer follow-up by hand.
  const orderId = await createManualOrder(orderInput).catch((err) => {
    reportError(err, { op: "createManualOrder", paymentMethod: payload.paymentMethod, total: totals.total });
    return null;
  });
  const finalOrderId = orderId ?? `LOCAL-${Date.now()}`;

  // Fire-and-forget the confirmation email. We `void` it so an email-provider hiccup never
  // blocks the checkout response — the order is real in Shopify either way, and the email
  // module returns false instead of throwing when the API key isn't configured.
  void sendOrderConfirmation({ ...orderInput, orderId: finalOrderId }).catch((err) => {
    reportError(err, { op: "sendOrderConfirmation", orderId: finalOrderId });
  });

  return NextResponse.json({ orderId: finalOrderId });
}

async function handleBogCard(
  orderInput: ManualOrderInput,
  totals: ServerComputedTotals,
  req: Request,
): Promise<NextResponse<CheckoutResponse>> {
  if (!isBogConfigured) {
    return NextResponse.json(
      { error: "cardUnavailable" },
      { status: 400 },
    );
  }

  const pending = await createPendingOrder(orderInput).catch((err) => {
    reportError(err, { op: "createPendingOrder", paymentMethod: orderInput.paymentMethod, total: totals.total });
    return null;
  });
  if (!pending) {
    return NextResponse.json(
      { error: "orderFailed" },
      { status: 502 },
    );
  }

  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? new URL(req.url).origin;

  const bog = await createBogPaymentOrder({
    externalOrderId: String(pending.id),
    // Charge the discounted total, not raw subtotal. Critical: the customer expects to pay
    // what the checkout UI showed them, and the discount was applied server-side.
    totalAmount: totals.total,
    currency: orderInput.subtotal.currencyCode,
    basket: orderInput.lines.map((l) => ({
      product_id: l.productHandle,
      description: `${l.productTitle} — ${l.variantTitle}`,
      quantity: l.quantity,
      unit_price: Number.parseFloat(l.unitPrice.amount),
    })),
    buyer: {
      full_name: `${orderInput.firstName} ${orderInput.lastName}`.trim(),
      email: orderInput.email,
      phone: orderInput.phone,
    },
    successUrl: `${origin}/${orderInput.locale}/checkout/success?order=${encodeURIComponent(pending.name)}`,
    failUrl: `${origin}/${orderInput.locale}/checkout/failed?order=${encodeURIComponent(pending.name)}`,
    callbackUrl: `${origin}/api/checkout/webhook`,
    language: orderInput.locale === "en" ? "en" : "ka",
  }).catch((err) => {
    reportError(err, { op: "createBogPaymentOrder", orderId: pending.id, total: totals.total });
    return null;
  });

  if (!bog) {
    return NextResponse.json(
      { error: "paymentSessionFailed" },
      { status: 502 },
    );
  }

  return NextResponse.json({ redirectUrl: bog.redirectUrl });
}

async function handleTbcCard(
  orderInput: ManualOrderInput,
  totals: ServerComputedTotals,
  req: Request,
): Promise<NextResponse<CheckoutResponse>> {
  if (!isTbcConfigured) {
    return NextResponse.json(
      { error: "cardUnavailable" },
      { status: 400 },
    );
  }

  const pending = await createPendingOrder(orderInput).catch((err) => {
    reportError(err, { op: "createPendingOrder", paymentMethod: orderInput.paymentMethod, total: totals.total });
    return null;
  });
  if (!pending) {
    return NextResponse.json(
      { error: "orderFailed" },
      { status: 502 },
    );
  }

  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? new URL(req.url).origin;

  const tbc = await createTbcPayment({
    externalOrderId: String(pending.id),
    totalAmount: totals.total,
    currency: orderInput.subtotal.currencyCode,
    // `locale` is what the callback reads to route the customer back into their own language —
    // without it every shopper lands on the Georgian success page.
    returnUrl: `${origin}/api/checkout/tbc/callback?order=${encodeURIComponent(pending.name)}&shopify=${pending.id}&locale=${encodeURIComponent(orderInput.locale)}`,
    callbackUrl: `${origin}/api/checkout/tbc/webhook?shopify=${pending.id}`,
    language: orderInput.locale === "en" ? "EN" : "KA",
    userIpAddress: getClientIp(req),
  }).catch((err) => {
    reportError(err, { op: "createTbcPayment", orderId: pending.id, total: totals.total });
    return null;
  });

  if (!tbc) {
    return NextResponse.json(
      { error: "paymentSessionFailed" },
      { status: 502 },
    );
  }

  return NextResponse.json({ redirectUrl: tbc.redirectUrl });
}

/**
 * Places the order in EchoDesk and routes the shopper accordingly.
 *
 * The response tells us which of two worlds we're in: a `payment_url` means the tenant has a
 * card provider live and the shopper still has to pay; its absence means the order is already
 * booked (cash on delivery / bank transfer) and we can confirm immediately.
 *
 * `public_token` is carried through to the success page so the customer can track the order
 * without an account — it's the credential, so it never appears in a log line.
 */
async function handleEchoDeskOrder(
  orderInput: ManualOrderInput,
  totals: ServerComputedTotals,
): Promise<NextResponse<CheckoutResponse>> {
  // Caught here rather than deep in the client so the shopper gets a useful instruction
  // instead of "could not create order".
  if (!toEchoDeskPaymentMethod(orderInput.paymentMethod)) {
    return NextResponse.json(
      { error: "bankTransferUnavailable" },
      { status: 400 },
    );
  }

  const outcome = await createGuestOrder(orderInput).catch((err) => {
    reportError(err, {
      op: "echodesk.createGuestOrder",
      paymentMethod: orderInput.paymentMethod,
      total: totals.total,
    });
    // Typed as the outcome union so a thrown request narrows the same way a rejected one
    // does — otherwise the `stock` branch below is unreachable to the compiler.
    return { ok: false, error: undefined } as GuestOrderOutcome;
  });

  if (!outcome.ok) {
    // EchoDesk's 4xx text is English prose; classify it so the client can say it in the
    // shopper's own language rather than rendering an English sentence on a Georgian page.
    if (outcome.stock) {
      // The one rejection we can explain precisely. The product name comes from the
      // merchant's own catalogue, and the count is a number — no backend prose reaches
      // the shopper, who reads our sentence in their own language.
      return NextResponse.json(
        { error: "insufficientStock", stock: outcome.stock },
        { status: 400 },
      );
    }
    return outcome.error
      ? NextResponse.json({ error: classifyOrderError(outcome.error) }, { status: 400 })
      : NextResponse.json({ error: "orderFailed" }, { status: 502 });
  }
  const order = outcome.order;

  // Card flow: the gateway owns the next step.
  if (order.paymentUrl) {
    return NextResponse.json({ redirectUrl: order.paymentUrl });
  }

  const reference = order.orderNumber ?? String(order.id);

  // Fire-and-forget confirmation, same as the manual flow: the order exists in EchoDesk either
  // way, and an email-provider hiccup shouldn't block the response.
  void sendOrderConfirmation({ ...orderInput, orderId: reference }).catch((err) => {
    reportError(err, { op: "sendOrderConfirmation", orderId: reference });
  });

  return NextResponse.json({ orderId: reference, trackingToken: order.publicToken });
}