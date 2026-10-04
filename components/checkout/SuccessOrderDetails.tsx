"use client";

import { ArrowLeft, Check, Link2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { orderNumberAction } from "@/app/actions/cart";
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
 * Arriving here after paying also empties the bag (it has been bought), and the address is
 * rewritten to carry the token and number, so a refresh or a bookmark keeps them.
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
    // Paid, so the order's promo code is spent — it can't be used again from this browser.
    markCouponUsed(pending.coupon);
    clear();
    if (!pendingToken) return;
    if (!tok) setTok(pendingToken);
    if (order) return;
    let cancelled = false;
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
