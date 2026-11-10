import { parseEchoDeskGid } from "../echodesk/adapt";
import type { ManualOrderInput } from "../shopify/orders";

/**
 * Tells the bookkeeping bot (hair-bot) that an order exists, so its sales sheet can follow the shop
 * without anyone retyping orders.
 *
 * Strictly best-effort: it is called fire-and-forget after EchoDesk has accepted the order, has a
 * short timeout, never throws, and does nothing when the two env vars are unset. A bot outage must
 * never be able to fail, slow down or duplicate a customer's checkout.
 *
 * What it sends is the order's reference, its public tracking token (the bot uses it to ask EchoDesk
 * whether the order was paid) and the lines with prices. No name, e-mail, phone or address.
 */
export type BotOrderPayload = {
  lines: { key: string; title: string; variantTitle: string; qty: number; unitPrice: number }[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  paymentMethod: string;
  pickup: boolean;
};

const amount = (m: { amount: string } | undefined): number => {
  const n = m ? Number.parseFloat(m.amount) : 0;
  return Number.isFinite(n) ? n : 0;
};

export function buildBotPayload(input: ManualOrderInput): BotOrderPayload {
  return {
    lines: input.lines.map((l) => {
      const ref = parseEchoDeskGid(l.variantId);
      return {
        // "variant:123" / "product:45" — the key typed into the sheet's column W.
        key: ref ? `${ref.kind}:${ref.id}` : l.variantId,
        title: l.productTitle,
        variantTitle: l.variantTitle,
        qty: l.quantity,
        unitPrice: amount(l.unitPrice),
      };
    }),
    subtotal: amount(input.subtotal),
    discount: amount(input.discount),
    shipping: amount(input.shipping),
    total: amount(input.total),
    paymentMethod: input.paymentMethod === "cod" ? "cod" : "card",
    pickup: input.pickup ?? false,
  };
}

export async function notifyBot(
  order: { orderNumber: string; token: string | undefined },
  input: ManualOrderInput,
): Promise<void> {
  const url = process.env.BOT_INGEST_URL;
  const secret = process.env.BOT_INGEST_SECRET;
  if (!url || !secret || !order.token) return;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${secret}` },
    body: JSON.stringify({
      orderNumber: order.orderNumber,
      token: order.token,
      createdAt: new Date().toISOString(),
      payload: buildBotPayload(input),
    }),
    signal: AbortSignal.timeout(4000),
  });
  if (!res.ok) throw new Error(`bot ingest answered ${res.status}`);
}
