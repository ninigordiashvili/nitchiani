"use client";

import { Minus, Plus, X } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useEffect, useRef } from "react";
import { Link } from "@/lib/i18n/routing";
import { useCart } from "@/lib/cart/store";
import type { Locale } from "@/lib/i18n/config";
import { formatPrice } from "@/lib/money";
import { BLUR_DATA_URL, safeImageSrc } from "@/lib/images";
import { CartUpsellRow } from "@/components/cart/CartUpsellRow";
import { ClearCartButton } from "@/components/cart/ClearCartButton";
import { CouponField } from "@/components/cart/CouponField";
import { EmptyCartRecommendations } from "@/components/cart/EmptyCartRecommendations";
import { FreeShippingProgress } from "@/components/cart/FreeShippingProgress";
import { HowItWorksButton } from "@/components/cart/HowItWorksButton";
import { useFocusTrap } from "@/lib/ui/use-focus-trap";
import { useSwipeDismiss } from "@/lib/ui/use-swipe-dismiss";

export function CartDrawer({ locale }: { locale: Locale }) {
  const t = useTranslations();
  const cart = useCart();
  const open = cart.open;
  const { dragOffset, handlers } = useSwipeDismiss({
    direction: "right",
    onDismiss: () => cart.setOpen(false),
  });
  const drawerRef = useRef<HTMLElement>(null);
  useFocusTrap(drawerRef, open);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div
      aria-hidden={!open}
      className="fixed inset-0 z-50 transition-opacity"
      style={{ opacity: open ? 1 : 0, pointerEvents: open ? "auto" : "none" }}
    >
      <div
        className="absolute inset-0"
        style={{ background: "rgba(10,31,31,0.45)" }}
        onClick={() => cart.setOpen(false)}
      />
      <aside
        ref={drawerRef}
        {...handlers}
        role="dialog"
        aria-modal="true"
        aria-label={t("nav.cart")}
        className="absolute top-0 right-0 flex h-full flex-col transition-transform duration-200"
        style={{
          background: "var(--surface)",
          // `100vw` (not `100%`) so the drawer covers the full viewport edge — the html-level
          // `scrollbar-gutter: stable` makes ancestors ~15px narrower than the viewport, which
          // was leaving every divider inside short on the right side.
          width: "min(100vw, 28rem)",
          transform: open
            ? dragOffset > 0
              ? `translateX(${dragOffset}px)`
              : "translateX(0)"
            : "translateX(100%)",
          // While dragging, disable the CSS transition so the drawer tracks the finger 1:1.
          // Releasing snaps it back via the original `transition-transform duration-200`.
          ...(dragOffset > 0 ? { transition: "none" } : {}),
        }}
      >
        {/* `mx-4` instead of `px-4` on every divider-bearing block in the drawer — the
            border-b/t are then inset 16px on both sides, symmetric. Content still sits
            16px from the drawer edges because the parent margin replaces the padding. */}
        <div className="mx-4 flex h-14 items-center justify-between gap-3 border-b border-black/10">
          <span className="label-eyebrow">
            {t("nav.cart")} · {cart.totalQuantity}
          </span>
          <div className="flex items-center gap-3">
            <ClearCartButton />
            <button
              type="button"
              onClick={() => cart.setOpen(false)}
              aria-label={t("nav.close")}
              className="-mr-2 flex h-10 w-10 cursor-pointer items-center justify-center"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {cart.lines.length === 0 ? (
          <div className="flex-1 overflow-y-auto">
            <EmptyCartRecommendations variant="drawer" onCloseDrawer={() => cart.setOpen(false)} />
          </div>
        ) : (
          <>
            {/* `no-scrollbar` hides the native vertical scrollbar inside the drawer.
                Without it, the scrollbar reclaims ~15px from the right edge of every
                child — dividers + the upsell row appear right-margined while left-aligned
                content stays flush. Native scroll (touch / wheel) still works. */}
            <div className="no-scrollbar flex-1 overflow-y-auto">
              <ul className="py-4">
                {cart.lines.map((line) => (
                  <li key={line.variantId} className="mx-4 flex gap-3 border-b border-black/5 py-4 last:border-b-0">
                    <div className="relative aspect-[4/5] w-20 flex-shrink-0 overflow-hidden rounded-md bg-black/5">
                      <Image
                        src={safeImageSrc(line.image.url)}
                        alt={line.image.altText}
                        fill
                        sizes="80px"
                        placeholder="blur"
                        blurDataURL={BLUR_DATA_URL}
                        className="object-cover"
                      />
                    </div>
                    <div className="flex flex-1 flex-col justify-between">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm leading-tight font-medium">{line.productTitle}</p>
                          <p className="text-xs opacity-60">{line.variantTitle}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => cart.removeLine(line.variantId)}
                          aria-label={t("cart.remove")}
                          className="-mt-1 -mr-1 flex h-7 w-7 flex-shrink-0 cursor-pointer items-center justify-center rounded-full opacity-50 transition-opacity hover:opacity-100"
                        >
                          <X size={14} />
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 rounded-md border border-black/10">
                          <button
                            type="button"
                            aria-label={t("nav.decreaseQuantity")}
                            onClick={() => cart.updateQuantity(line.variantId, line.quantity - 1)}
                            className="flex h-8 w-8 cursor-pointer items-center justify-center"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="w-6 text-center text-sm">{line.quantity}</span>
                          <button
                            type="button"
                            aria-label={t("nav.increaseQuantity")}
                            onClick={() => cart.updateQuantity(line.variantId, line.quantity + 1)}
                            className="flex h-8 w-8 cursor-pointer items-center justify-center"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                        <span className="text-sm font-medium">
                          {formatPrice(
                            {
                              amount: (
                                Number.parseFloat(line.unitPrice.amount) * line.quantity
                              ).toFixed(2),
                              currencyCode: line.unitPrice.currencyCode,
                            },
                            locale,
                          )}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
              <CartUpsellRow variant="drawer" />
            </div>

            <div className="mx-4 border-t border-black/10 py-4">
              <FreeShippingProgress subtotal={cart.subtotal} />
              <CouponField />
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="opacity-70">{t("cart.subtotal")}</span>
                <span className="tabular-nums">{formatPrice(cart.subtotal, locale)}</span>
              </div>
              {cart.coupon && Number.parseFloat(cart.discount.amount) > 0 ? (
                <div
                  className="mb-1 flex items-center justify-between text-sm"
                  style={{ color: "var(--color-brand-maroon)" }}
                >
                  <span className="opacity-80">
                    {t("cart.discount")} · {cart.coupon.code}
                  </span>
                  <span className="tabular-nums">−{formatPrice(cart.discount, locale)}</span>
                </div>
              ) : null}
              <div className="mt-2 mb-4 flex items-center justify-between border-t border-black/5 pt-2 text-sm">
                <span className="font-medium">{t("cart.total")}</span>
                <span className="font-medium tabular-nums">{formatPrice(cart.total, locale)}</span>
              </div>
              <Link
                href="/checkout"
                onClick={() => cart.setOpen(false)}
                className="btn-primary w-full"
              >
                {t("cart.checkout")}
              </Link>
              <div className="mt-3 flex justify-center">
                <HowItWorksButton />
              </div>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
