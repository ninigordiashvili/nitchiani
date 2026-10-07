"use client";

import { Minus, Plus, Store, Truck } from "lucide-react";
import { useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { BUSINESS } from "@/lib/business";
import type { Product } from "@/lib/shopify/types";
import { useCart } from "@/lib/cart/store";
import { useSoldOut } from "@/lib/cart/sold-out";
import { clampToStock, isAtStockLimit, lowStockCount } from "@/lib/cart/stock";
import { AddToCartButton } from "./AddToCartButton";
import { LowStockNotice } from "./LowStockNotice";
import { PriceDisplay } from "./PriceDisplay";
import { StickyAddToCart } from "./StickyAddToCart";
import { VariantPicker } from "./VariantPicker";

/**
 * Owns the selected variant + quantity on a PDP. Composes price + picker + qty stepper +
 * add-to-bag so they all stay in sync when the user picks a different size/color/length.
 *
 * Also renders the mobile sticky CTA, which mirrors the same selected variant and quantity
 * and only shows when the inline button has scrolled out of view.
 *
 * Picker self-hides for single-SKU products (the price + qty + Add to bag still render).
 */
export function ProductPurchase({
  product,
  showSizeGuide = true,
  onAdded,
}: {
  product: Product;
  showSizeGuide?: boolean;
  /** Passed straight to AddToCartButton — the quick-view sheet closes on it. */
  onAdded?: () => void;
}) {
  const t = useTranslations("product");
  const cart = useCart();
  const locale = useLocale();
  const tNav = useTranslations("nav");
  const [selected, setSelected] = useState(
    product.variants.find((v) => v.availableForSale) ?? product.variants[0],
  );
  const [quantity, setQuantity] = useState(1);
  const knownSoldOut = useSoldOut();
  const lowStock =
    selected.availableForSale && !knownSoldOut(product.handle)
      ? lowStockCount(selected.quantityAvailable)
      : null;
  // The stepper's ceiling is what the bag can still take, not the raw stock: with 1 left and
  // 1 already in the bag, there's nothing more to choose.
  const room = cart.canAdd(selected.id, selected.quantityAvailable);
  const stepMax = Number.isFinite(room) ? Math.max(1, room) : undefined;

  const inlineCtaRef = useRef<HTMLDivElement>(null);

  return (
    <div className="space-y-5">
      <PriceDisplay
        price={selected.price}
        compareAt={selected.compareAtPrice}
        size="lg"
      />

      <VariantPicker
        product={product}
        selectedVariant={selected}
        onSelect={setSelected}
        showSizeGuide={showSizeGuide}
      />

      {lowStock !== null ? <LowStockNotice count={lowStock} /> : null}

      <div ref={inlineCtaRef} className="flex items-stretch gap-3">
        <div className="flex items-center rounded-md border border-black/15">
          <button
            type="button"
            aria-label={tNav("decreaseQuantity")}
            disabled={quantity <= 1}
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="flex h-full cursor-pointer items-center justify-center px-3 disabled:cursor-not-allowed disabled:opacity-30"
          >
            <Minus size={14} />
          </button>
          <span className="min-w-[2rem] text-center text-sm tabular-nums">
            {quantity}
          </span>
          <button
            type="button"
            aria-label={tNav("increaseQuantity")}
            onClick={() => setQuantity((q) => clampToStock(q + 1, stepMax))}
            disabled={isAtStockLimit(quantity, stepMax)}
            className="flex h-full cursor-pointer items-center justify-center px-3 disabled:cursor-not-allowed disabled:opacity-30"
          >
            <Plus size={14} />
          </button>
        </div>
        <div className="flex-1">
          <AddToCartButton product={product} variant={selected} quantity={quantity} onAdded={onAdded} />
        </div>
      </div>

      {/* How it reaches you, right under the button — the next thing a shopper asks. A card
          rather than a grey caption, so it's read rather than skipped. */}
      <ul className="divide-y divide-black/10 rounded-md border border-black/10 bg-white/70 text-[13px]">
        <DeliveryRow icon={<Truck size={16} />} title={t("deliveryTitle")} detail={t("shipsIn")} />
        <DeliveryRow
          icon={<Store size={16} />}
          title={t("pickupTitle")}
          detail={`${locale === "ka" ? BUSINESS.street.ka : BUSINESS.street.en}, ${locale === "ka" ? "თბილისი" : "Tbilisi"}`}
        />
      </ul>

      <StickyAddToCart
        product={product}
        variant={selected}
        quantity={quantity}
        inlineCtaRef={inlineCtaRef}
      />
    </div>
  );
}

function DeliveryRow({ icon, title, detail }: { icon: React.ReactNode; title: string; detail: string }) {
  return (
    <li className="flex items-center gap-3 px-3 py-2.5">
      <span
        className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full"
        style={{
          background: "color-mix(in oklab, var(--color-brand-maroon) 12%, transparent)",
          color: "var(--color-brand-maroon)",
        }}
        aria-hidden
      >
        {icon}
      </span>
      <span className="min-w-0">
        <span className="block font-medium text-[var(--color-brand-ink)]">{title}</span>
        <span className="block text-xs opacity-70">{detail}</span>
      </span>
    </li>
  );
}
