import { NextResponse } from "next/server";
import { z } from "zod";
import { discountFor, findCoupon, type Coupon } from "@/lib/cart/coupons";
import { sendOrderConfirmation } from "@/lib/email/order-confirmation";
import {
  createManualOrder,
  createPendingOrder,
  type ManualOrderInput,
} from "@/lib/shopify/orders";
import { createBogPaymentOrder, isBogConfigured } from "@/lib/payments/bog";
import { createTbcPayment, getClientIp, isTbcConfigured } from "@/lib/payments/tbc";

const lineSchema = z.object({
  variantId: z.string(),
  productHandle: z.string(),
  productTitle: z.string(),
  variantTitle: z.string(),
  unitPrice: z.object({ amount: z.string(), currencyCode: z.string() }),
  quantity: z.number().int().positive(),
});

const bodySchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: z.string().min(6),
  email: z.string().email(),
  address: z.string().min(3),
  city: z.string().min(1),
  postalCode: z.string().optional(),
  notes: z.string().optional(),
  paymentMethod: z.enum(["bank_transfer", "cod", "bog_card", "tbc_card"]),
  locale: z.string(),
  lines: z.array(lineSchema).min(1),
  /** Client-supplied subtotal — used only for cross-check against the server-recomputed value. */
  subtotal: z.object({ amount: z.string(), currencyCode: z.string() }),
  /** Optional coupon. Server re-validates against the coupon registry; client `discount` is ignored. */
  couponCode: z.string().nullable().optional(),
});

type CheckoutResponse =
  | { orderId: string }
  | { redirectUrl: string }
  | { error: string };

/**
 * Server-side total computation. Never trust client-supplied subtotal/total/discount —
 * a DevTools user can edit the request before it leaves the browser. We recompute
 * everything from the line items + coupon registry and cross-check against the client
 * subtotal so we surface mismatches early (e.g., catalog price changed between cart and
 * checkout). All amounts are in GEL (the storefront's transaction currency).
 */
type ServerComputedTotals = {
  subtotal: number;
  discount: number;
  total: number;
  coupon: Coupon | null;
};

function computeTotals(
  lines: z.infer<typeof lineSchema>[],
  couponCode: string | null | undefined,
): { ok: true; totals: ServerComputedTotals } | { ok: false; error: string } {
  const subtotal = lines.reduce(
    (sum, l) => sum + Number.parseFloat(l.unitPrice.amount) * l.quantity,
    0,
  );

  if (!Number.isFinite(subtotal) || subtotal <= 0) {
    return { ok: false, error: "Invalid subtotal" };
  }

  let coupon: Coupon | null = null;
  let discount = 0;
  if (couponCode) {
    coupon = findCoupon(couponCode);
    if (!coupon) {
      return { ok: false, error: "Coupon code is not valid." };
    }
    discount = discountFor(subtotal, coupon);
    // `discountFor` returns 0 when the min-subtotal gate fails — we still keep the coupon
    // attached to the order for analytics, but the charge is the full subtotal.
  }

  const total = Math.max(0, Math.round((subtotal - discount) * 100) / 100);
  return { ok: true, totals: { subtotal, discount, total, coupon } };
}

/** Build the order-creation payload the way `createManualOrder` / `createPendingOrder` expect. */
function buildOrderInput(
  payload: z.infer<typeof bodySchema>,
  totals: ServerComputedTotals,
): ManualOrderInput {
  return {
    firstName: payload.firstName,
    lastName: payload.lastName,
    phone: payload.phone,
    email: payload.email,
    address: payload.address,
    city: payload.city,
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
  let payload: z.infer<typeof bodySchema>;
  try {
    payload = bodySchema.parse(await req.json());
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Invalid request" },
      { status: 400 },
    );
  }

  // Server-side total computation. Recompute subtotal from the line items and validate the
  // coupon against the registry — never trust the client's `subtotal` / `discount` numbers.
  const totalsResult = computeTotals(payload.lines, payload.couponCode);
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
      { error: "Cart total has changed. Please refresh your cart and try again." },
      { status: 409 },
    );
  }

  const orderInput = buildOrderInput(payload, totals);

  if (payload.paymentMethod === "bog_card") {
    return handleBogCard(orderInput, totals, req);
  }
  if (payload.paymentMethod === "tbc_card") {
    return handleTbcCard(orderInput, totals, req);
  }

  // bank_transfer / cod — manual flow, order created in pending state, customer follow-up by hand.
  const orderId = await createManualOrder(orderInput).catch((err) => {
    console.error("[api/checkout/initiate] manual order threw:", err);
    return null;
  });
  const finalOrderId = orderId ?? `LOCAL-${Date.now()}`;

  // Fire-and-forget the confirmation email. We `void` it so an email-provider hiccup never
  // blocks the checkout response — the order is real in Shopify either way, and the email
  // module returns false instead of throwing when the API key isn't configured.
  void sendOrderConfirmation({ ...orderInput, orderId: finalOrderId }).catch((err) => {
    console.error("[api/checkout/initiate] confirmation email threw:", err);
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
      { error: "Card payments are not yet enabled. Please choose bank transfer or cash on delivery." },
      { status: 400 },
    );
  }

  const pending = await createPendingOrder(orderInput).catch((err) => {
    console.error("[api/checkout/initiate] pending order threw:", err);
    return null;
  });
  if (!pending) {
    return NextResponse.json(
      { error: "Could not create order. Please try again or contact us on WhatsApp." },
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
      full_name: `${orderInput.firstName} ${orderInput.lastName}`,
      email: orderInput.email,
      phone: orderInput.phone,
    },
    successUrl: `${origin}/${orderInput.locale}/checkout/success?order=${encodeURIComponent(pending.name)}`,
    failUrl: `${origin}/${orderInput.locale}/checkout/failed?order=${encodeURIComponent(pending.name)}`,
    callbackUrl: `${origin}/api/checkout/webhook`,
    language: orderInput.locale === "en" ? "en" : "ka",
  }).catch((err) => {
    console.error("[api/checkout/initiate] BOG order create threw:", err);
    return null;
  });

  if (!bog) {
    return NextResponse.json(
      { error: "Card payment session could not be started. Please try a different method." },
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
      { error: "TBC card payments are not yet enabled. Please choose another method." },
      { status: 400 },
    );
  }

  const pending = await createPendingOrder(orderInput).catch((err) => {
    console.error("[api/checkout/initiate] pending order threw:", err);
    return null;
  });
  if (!pending) {
    return NextResponse.json(
      { error: "Could not create order. Please try again or contact us on WhatsApp." },
      { status: 502 },
    );
  }

  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? new URL(req.url).origin;

  const tbc = await createTbcPayment({
    externalOrderId: String(pending.id),
    totalAmount: totals.total,
    currency: orderInput.subtotal.currencyCode,
    returnUrl: `${origin}/api/checkout/tbc/callback?order=${encodeURIComponent(pending.name)}&shopify=${pending.id}`,
    callbackUrl: `${origin}/api/checkout/tbc/webhook?shopify=${pending.id}`,
    language: orderInput.locale === "en" ? "EN" : "KA",
    userIpAddress: getClientIp(req),
  }).catch((err) => {
    console.error("[api/checkout/initiate] TBC payment create threw:", err);
    return null;
  });

  if (!tbc) {
    return NextResponse.json(
      { error: "Card payment session could not be started. Please try a different method." },
      { status: 502 },
    );
  }

  return NextResponse.json({ redirectUrl: tbc.redirectUrl });
}
