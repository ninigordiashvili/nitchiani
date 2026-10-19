"use client";

import { Minus, Plus, Store, Truck } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { BUSINESS } from "@/lib/business";
import type { Product } from "@/lib/shopify/types";
import { useCart } from "@/lib/cart/store";
import { useSoldOut } from "@/lib/cart/sold-out";
import { variantForPhoto } from "@/lib/images";
import { showVariantPhoto, usePhotoOnScreen } from "@/lib/ui/variant-photo";
import { useSetUrlQuery, useUrlQuery } from "@/lib/ui/use-url-query";
import { parseEchoDeskGid } from "@/lib/echodesk/adapt";
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
  compact = false,
  syncUrl = false,
  onAdded,
}: {
  product: Product;
  showSizeGuide?: boolean;
  /**
   * Quick view: price, choice and buy button, nothing else.
   *
   * The sheet is sized to its photo, and the delivery card is 110px of answers to a question
   * nobody asks before choosing a colour — it belongs on the product page, which is one tap
   * away from the sheet. Without this the panel outgrew the photo and had to scroll.
   */
  compact?: boolean;
  /**
   * Write the chosen variant into the address bar as `?variant=<id>`, and read it on arrival.
   *
   * Only the product page does this. The quick-view sheet shows a product the URL is not
   * about — the address there belongs to the grid behind it — so a colour picked in the sheet
   * must not rewrite it.
   */
  syncUrl?: boolean;
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

  // `?variant=3` — a link to one colour. Read once on arrival, and only on the product page:
  // shared from Instagram, it should open on the durag the post is about rather than on
  // whichever colour happens to be in stock first.
  const query = useUrlQuery();
  const setQuery = useSetUrlQuery("replace");
  const wantedVariant = syncUrl ? query.get("variant") : null;
  useEffect(() => {
    if (!wantedVariant) return;
    const match = product.variants.find(
      (v) => String(parseEchoDeskGid(v.id)?.id ?? "") === wantedVariant,
    );
    if (match) setSelected((current) => (match.id === current.id ? current : match));
  }, [wantedVariant, product.variants]);
  const [quantity, setQuantity] = useState(1);

  // Reflect the choice back into the address bar, so the link in the browser is the link worth
  // sharing. Only for a product with a choice to make: `?variant=` on a single-SKU product is
  // noise in every URL copied from the site.
  const variantParam =
    syncUrl && product.variants.length > 1
      ? (String(parseEchoDeskGid(selected.id)?.id ?? "") || null)
      : null;
  useEffect(() => {
    if (!syncUrl || !variantParam) return;
    if (query.get("variant") === variantParam) return;
    setQuery({ variant: variantParam });
    // `query` is a fresh object each render; depending on it would loop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [syncUrl, variantParam, setQuery]);
  // Tell the gallery which photo the current choice wears.
  useEffect(() => {
    showVariantPhoto(selected.image?.url ?? null);
  }, [selected]);

  // And clear it on the way out, so the next product doesn't open on the last one's colour.
  // On unmount only — see the matching note in ProductGallery.
  useEffect(() => () => showVariantPhoto(null), []);
  // And follow it back: a shopper who swipes to the blonde photo has chosen blonde. Which
  // photos count as a choice is `variantForPhoto`'s rule.
  const onScreen = usePhotoOnScreen();
  useEffect(() => {
    const match = variantForPhoto(product.variants, onScreen);
    if (match) setSelected((current) => (match.id === current.id ? current : match));
  }, [onScreen, product.variants]);
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
    <div className={compact ? "space-y-3.5" : "space-y-5"}>
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

      {/* The merchant's own code for exactly what is selected. Quiet on purpose — it is not
          a selling point — but a lot of this shop's orders start as an Instagram or WhatsApp
          message, and "SATIN_DURAG_RED" is a message that cannot be misread, where "the red
          one" can. Hidden in quick view, where the panel is sized to the photo. */}
      {!compact && (selected.sku || product.sku) ? (
        <p className="-mt-1 text-xs opacity-55">
          {t("skuLabel")}:{" "}
          <span className="font-medium tracking-wide opacity-90">
            {selected.sku || product.sku}
          </span>
        </p>
      ) : null}

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
          rather than a grey caption, so it's read rather than skipped. Not in quick view,
          where the sheet is sized to its photo and this is what overran it. */}
      {compact ? null : (
        <ul className="divide-y divide-black/10 rounded-md border border-black/10 bg-white/70 text-[13px]">
          <DeliveryRow icon={<Truck size={16} />} title={t("deliveryTitle")} detail={t("shipsIn")} />
          <DeliveryRow
            icon={<Store size={16} />}
            title={t("pickupTitle")}
            detail={`${locale === "ka" ? BUSINESS.street.ka : BUSINESS.street.en}, ${locale === "ka" ? "თბილისი" : "Tbilisi"}`}
          />
        </ul>
      )}

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
