"use client";

import { ArrowLeft, Check, Link2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { orderNumberAction, paymentStateAction } from "@/app/actions/cart";
import { OrderNumber } from "@/components/commerce/OrderNumber";
import { useCart } from "@/lib/cart/store";
import { loadPendingPayment } from "@/lib/cart/pending-payment";
import { markCouponUsed } from "@/lib/cart/used-coupons";
import { Link } from "@/lib/i18n/routing";

/**
 * The order number and tracking link on the success page.
 *
 * A card payment returns the shopper here from the bank with nothing in the address, so the
 * page used to show neither — and "track order" opened an empty lookup. The browser still
 * holds the order's public token from when checkout sent them to pay (see
 * lib/cart/pending-payment.ts): that gives the tracking link, and one lookup gives the number.
 *
 * Arriving here empties the bag only once EchoDesk confirms the payment — the gateway decides
 * which URL a cancelled card returns to, and this page is a candidate. The address is rewritten
 * to carry the token and number, so a refresh or a bookmark keeps them.
 */
export function SuccessOrderDetails({ order, token }: { order?: string; token?: string }) {
  const t = useTranslations("checkout");
  const tCart = useTranslations("cart");
  const { clear } = useCart();
  const [number, setNumber] = useState(order);
  const [tok, setTok] = useState(token);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const pending = loadPendingPayment();
    if (!pending) return;
    // Read before clearing: emptying the bag also forgets the pending payment.
    const pendingToken = pending.token;
    const pendingCoupon = pending.coupon;
    if (!pendingToken) return;
    if (!tok) setTok(pendingToken);
    let cancelled = false;

    // Landing on this page is not proof of payment: whether the gateway sends a cancelled or
    // declined card here depends on its return-URL configuration, and this used to empty the
    // bag and spend the shopper's one-time code on arrival, for an order nobody had paid for.
    // So ask EchoDesk, the way the cart's own settle path does.
    void paymentStateAction(pendingToken).then((state) => {
      if (cancelled || state !== "paid") return;
      markCouponUsed(pendingCoupon);
      clear();
    });

    if (order) return;
    void orderNumberAction(pendingToken).then((n) => {
      if (cancelled) return;
      if (n) setNumber(n);
      const qs = new URLSearchParams({ token: pendingToken, ...(n ? { order: n } : {}) });
      window.history.replaceState(window.history.state, "", `${window.location.pathname}?${qs}`);
    });
    return () => {
      cancelled = true;
    };
    // Once, on arrival.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // The token is what makes tracking work without an account, so prefer it; the order number
  // is the fallback for flows that don't issue one.
  const trackHref = tok
    ? `/order-status?token=${encodeURIComponent(tok)}`
    : number
      ? `/order-status?order=${encodeURIComponent(number)}`
      : "/order-status";

  const copyTrackingLink = async () => {
    if (!tok) return;
    try {
      await navigator.clipboard.writeText(`${window.location.origin}${trackHref}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2400);
    } catch {
      // Clipboard blocked: the tracking button beside it still works.
    }
  };

  return (
    <>
      {number ? <OrderNumber number={number} /> : null}
      {/* The link is what tracking actually needs, so it's one tap to keep — nobody should
          have to copy a long code out of an email by hand. */}
      {tok ? (
        <button
          type="button"
          onClick={copyTrackingLink}
          className="inline-flex cursor-pointer items-center gap-1.5 text-[13px] font-medium text-[var(--color-brand-maroon)] hover:underline hover:underline-offset-2"
        >
          {copied ? <Check size={14} aria-hidden /> : <Link2 size={14} aria-hidden />}
          {copied ? t("trackingLinkCopied") : t("copyTrackingLink")}
        </button>
      ) : null}
      <div className="mt-3 flex flex-wrap justify-center gap-3">
        <Link href={trackHref} className="btn-primary">
          {t("trackOrder")}
        </Link>
        <Link href="/" className="btn-ghost">
          <ArrowLeft size={14} />
          {tCart("continueShopping")}
        </Link>
      </div>
    </>
  );
}
