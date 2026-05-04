import { NextResponse } from "next/server";
import { z } from "zod";
import { createManualOrder, createPendingOrder } from "@/lib/shopify/orders";
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
  subtotal: z.object({ amount: z.string(), currencyCode: z.string() }),
});

type CheckoutResponse =
  | { orderId: string }
  | { redirectUrl: string }
  | { error: string };

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

  if (payload.paymentMethod === "bog_card") {
    return handleBogCard(payload, req);
  }
  if (payload.paymentMethod === "tbc_card") {
    return handleTbcCard(payload, req);
  }

  // bank_transfer / cod — manual flow, order created in pending state, customer follow-up by hand.
  const orderId = await createManualOrder(payload).catch((err) => {
    console.error("[api/checkout/initiate] manual order threw:", err);
    return null;
  });
  if (orderId) return NextResponse.json({ orderId });

  return NextResponse.json({ orderId: `LOCAL-${Date.now()}` });
}

async function handleBogCard(
  payload: z.infer<typeof bodySchema>,
  req: Request,
): Promise<NextResponse<CheckoutResponse>> {
  if (!isBogConfigured) {
    return NextResponse.json(
      { error: "Card payments are not yet enabled. Please choose bank transfer or cash on delivery." },
      { status: 400 },
    );
  }

  const pending = await createPendingOrder(payload).catch((err) => {
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
  const totalAmount = Number.parseFloat(payload.subtotal.amount);

  const bog = await createBogPaymentOrder({
    externalOrderId: String(pending.id),
    totalAmount,
    currency: payload.subtotal.currencyCode,
    basket: payload.lines.map((l) => ({
      product_id: l.productHandle,
      description: `${l.productTitle} — ${l.variantTitle}`,
      quantity: l.quantity,
      unit_price: Number.parseFloat(l.unitPrice.amount),
    })),
    buyer: {
      full_name: `${payload.firstName} ${payload.lastName}`,
      email: payload.email,
      phone: payload.phone,
    },
    successUrl: `${origin}/${payload.locale}/checkout/success?order=${encodeURIComponent(pending.name)}`,
    failUrl: `${origin}/${payload.locale}/checkout/failed?order=${encodeURIComponent(pending.name)}`,
    callbackUrl: `${origin}/api/checkout/webhook`,
    language: payload.locale === "en" ? "en" : "ka",
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
  payload: z.infer<typeof bodySchema>,
  req: Request,
): Promise<NextResponse<CheckoutResponse>> {
  if (!isTbcConfigured) {
    return NextResponse.json(
      { error: "TBC card payments are not yet enabled. Please choose another method." },
      { status: 400 },
    );
  }

  const pending = await createPendingOrder(payload).catch((err) => {
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
  const totalAmount = Number.parseFloat(payload.subtotal.amount);

  const tbc = await createTbcPayment({
    externalOrderId: String(pending.id),
    totalAmount,
    currency: payload.subtotal.currencyCode,
    returnUrl: `${origin}/api/checkout/tbc/callback?order=${encodeURIComponent(pending.name)}&shopify=${pending.id}`,
    callbackUrl: `${origin}/api/checkout/tbc/webhook?shopify=${pending.id}`,
    language: payload.locale === "en" ? "EN" : "KA",
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
