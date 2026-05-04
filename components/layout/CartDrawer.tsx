"use client";

import { Minus, Plus, X } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { Link } from "@/lib/i18n/routing";
import { useCart } from "@/lib/cart/store";
import type { Locale } from "@/lib/i18n/config";
import { formatPrice } from "@/lib/money";
import { safeImageSrc } from "@/lib/images";
import { EmptyCartRecommendations } from "@/components/cart/EmptyCartRecommendations";

export function CartDrawer({ locale }: { locale: Locale }) {
  const t = useTranslations();
  const cart = useCart();
  const open = cart.open;

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
        className="absolute top-0 right-0 flex h-full w-full max-w-md flex-col transition-transform duration-300"
        style={{
          background: "var(--color-brand-cream)",
          transform: open ? "translateX(0)" : "translateX(100%)",
        }}
      >
        <div className="flex h-14 items-center justify-between border-b border-black/10 px-4">
          <span className="label-eyebrow">{t("nav.cart")} · {cart.totalQuantity}</span>
          <button
            type="button"
            onClick={() => cart.setOpen(false)}
            aria-label="Close cart"
            className="-mr-2 flex h-10 w-10 items-center justify-center"
          >
            <X size={20} />
          </button>
        </div>

        {cart.lines.length === 0 ? (
          <div className="flex-1 overflow-y-auto">
            <EmptyCartRecommendations
              variant="drawer"
              onCloseDrawer={() => cart.setOpen(false)}
            />
          </div>
        ) : (
          <>
            <ul className="flex-1 overflow-y-auto px-4 py-4">
              {cart.lines.map((line) => (
                <li key={line.variantId} className="flex gap-3 border-b border-black/5 py-4">
                  <div className="relative h-24 w-20 flex-shrink-0 overflow-hidden rounded-md bg-black/5">
                    <Image
                      src={safeImageSrc(line.image.url)}
                      alt={line.image.altText}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </div>
                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <p className="text-sm font-medium leading-tight">{line.productTitle}</p>
                      <p className="text-xs opacity-60">{line.variantTitle}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 rounded-md border border-black/10">
                        <button
                          type="button"
                          aria-label="Decrease"
                          onClick={() =>
                            cart.updateQuantity(line.variantId, line.quantity - 1)
                          }
                          className="flex h-8 w-8 items-center justify-center"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-6 text-center text-sm">{line.quantity}</span>
                        <button
                          type="button"
                          aria-label="Increase"
                          onClick={() =>
                            cart.updateQuantity(line.variantId, line.quantity + 1)
                          }
                          className="flex h-8 w-8 items-center justify-center"
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

            <div className="border-t border-black/10 px-4 py-4">
              <div className="mb-3 flex items-center justify-between text-sm">
                <span className="opacity-70">{t("cart.subtotal")}</span>
                <span className="font-medium">{formatPrice(cart.subtotal, locale)}</span>
              </div>
              <p className="mb-4 text-xs opacity-60">{t("cart.shippingNote")}</p>
              <Link
                href="/checkout"
                onClick={() => cart.setOpen(false)}
                className="btn-primary w-full"
              >
                {t("cart.checkout")}
              </Link>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
