"use client";

import { Minus, Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/routing";
import { useCart } from "@/lib/cart/store";
import { formatPrice } from "@/lib/money";
import type { Locale } from "@/lib/i18n/config";
import { BLUR_DATA_URL, safeImageSrc } from "@/lib/images";
import { CartUpsellRow } from "@/components/cart/CartUpsellRow";
import { CouponField } from "@/components/cart/CouponField";
import { EmptyCartRecommendations } from "@/components/cart/EmptyCartRecommendations";
import { HowItWorksButton } from "@/components/cart/HowItWorksButton";

export default function CartPage() {
  const t = useTranslations();
  const locale = useLocale() as Locale;
  const cart = useCart();

  if (cart.lines.length === 0) {
    return (
      <div className="container-shop py-8 sm:py-12">
        <EmptyCartRecommendations variant="page" />
      </div>
    );
  }

  return (
    <div className="container-shop py-8 sm:py-12">
      <h1 className="font-display mb-6 text-3xl tracking-tight sm:text-4xl">
        {t("nav.cart")}
      </h1>

      <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
        <ul className="divide-y divide-black/10">
          {cart.lines.map((line) => (
            <li key={line.variantId} className="flex gap-4 py-5">
              <div className="relative aspect-[4/5] w-28 flex-shrink-0 overflow-hidden bg-black/5">
                <Image
                  src={safeImageSrc(line.image.url)}
                  alt={line.image.altText}
                  fill
                  sizes="112px"
                  placeholder="blur"
                  blurDataURL={BLUR_DATA_URL}
                  className="object-cover"
                />
              </div>
              <div className="flex flex-1 flex-col justify-between">
                <div>
                  <Link
                    href={`/products/${line.productHandle}`}
                    className="font-medium leading-tight"
                  >
                    {line.productTitle}
                  </Link>
                  <p className="mt-0.5 text-xs opacity-60">{line.variantTitle}</p>
                </div>
                <div className="flex items-end justify-between">
                  <div className="flex items-center gap-2 rounded-md border border-black/10">
                    <button
                      type="button"
                      onClick={() =>
                        cart.updateQuantity(line.variantId, line.quantity - 1)
                      }
                      aria-label="Decrease"
                      className="flex h-9 w-9 cursor-pointer items-center justify-center"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-7 text-center text-sm">{line.quantity}</span>
                    <button
                      type="button"
                      onClick={() =>
                        cart.updateQuantity(line.variantId, line.quantity + 1)
                      }
                      aria-label="Increase"
                      className="flex h-9 w-9 cursor-pointer items-center justify-center"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium tabular-nums">
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
                    <button
                      type="button"
                      onClick={() => cart.removeLine(line.variantId)}
                      aria-label={t("cart.remove")}
                      className="opacity-50 transition-opacity hover:opacity-100"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <aside className="h-fit border border-black/10 p-6 lg:sticky lg:top-20">
          <h2 className="font-display mb-4 text-xl">{t("cart.subtotal")}</h2>
          <CouponField />
          <div className="flex items-center justify-between text-sm">
            <span className="opacity-70">{t("cart.subtotal")}</span>
            <span className="tabular-nums">{formatPrice(cart.subtotal, locale)}</span>
          </div>
          {cart.coupon && Number.parseFloat(cart.discount.amount) > 0 ? (
            <div
              className="mt-1 flex items-center justify-between text-sm"
              style={{ color: "var(--color-brand-maroon)" }}
            >
              <span className="opacity-80">
                {t("cart.discount")} · {cart.coupon.code}
              </span>
              <span className="tabular-nums">−{formatPrice(cart.discount, locale)}</span>
            </div>
          ) : null}
          <div className="mt-2 flex items-center justify-between text-sm">
            <span className="opacity-70">{t("cart.shipping")}</span>
            <span className="opacity-60">{t("cart.shippingNote")}</span>
          </div>
          <div className="my-4 border-t border-black/10" />
          <div className="flex items-center justify-between">
            <span className="font-medium">{t("cart.total")}</span>
            <span className="font-display text-xl tabular-nums">
              {formatPrice(cart.total, locale)}
            </span>
          </div>
          <Link href="/checkout" className="btn-primary mt-6 w-full">
            {t("cart.checkout")}
          </Link>
          <div className="mt-3 flex justify-center">
            <HowItWorksButton />
          </div>
        </aside>
      </div>

      <CartUpsellRow variant="page" />
    </div>
  );
}
