"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ImageRef, Money } from "../shopify/types";
import { type Coupon, type CouponError, discountFor, findCoupon } from "./coupons";
import { checkPromoAction } from "@/app/actions/promo";
import type { PromoReason } from "@/lib/echodesk/promo";

// Bump the version when image hosts or line shape change, so stale localStorage entries
// don't crash the cart UI on the next visit.
//   v1 → Unsplash URLs (broken hostnames)
//   v2 → picsum + local images
//   v3 → variant titles changed (no longer always "One Size") — old variantIds may be stale
const STORAGE_KEY = "nitchiani:cart:v3";
const LEGACY_STORAGE_KEYS = ["nitchiani:cart:v1", "nitchiani:cart:v2"];
const COUPON_STORAGE_KEY = "nitchiani:cart:coupon:v1";

export type LocalCartLine = {
  variantId: string;
  productHandle: string;
  productTitle: string;
  variantTitle: string;
  image: ImageRef;
  unitPrice: Money;
  quantity: number;
};

type CartState = {
  lines: LocalCartLine[];
  totalQuantity: number;
  /** Pre-discount sum of line items. Always in GEL (transaction currency). */
  subtotal: Money;
  coupon: Coupon | null;
  /** GEL amount removed by the applied coupon. Zero if no coupon or min not met. */
  discount: Money;
  /** Post-discount total. Equal to `subtotal` when no coupon is applied. */
  total: Money;
  /** Last attempted-apply error, cleared by a successful apply or remove. */
  couponError: CouponError | null;
  /** Backend explanation for a rejected code, when there is one. */
  /** Why the last code was rejected, as a translatable key — never backend prose. */
  couponReason: PromoReason | null;
  /** Threshold behind a `minimum` rejection, when known. */
  couponMinSubtotal: number | null;
};

type CartActions = {
  addLine: (line: Omit<LocalCartLine, "quantity"> & { quantity?: number }) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  removeLine: (variantId: string) => void;
  clear: () => void;
  applyCoupon: (code: string) => Promise<boolean>;
  removeCoupon: () => void;
  clearCouponError: () => void;
  open: boolean;
  setOpen: (open: boolean) => void;
};

const CartContext = createContext<(CartState & CartActions) | null>(null);

function computeTotals(lines: LocalCartLine[]): {
  totalQuantity: number;
  subtotal: Money;
} {
  const totalQuantity = lines.reduce((sum, l) => sum + l.quantity, 0);
  const currency = lines[0]?.unitPrice.currencyCode ?? "GEL";
  const amount = lines.reduce(
    (sum, l) => sum + Number.parseFloat(l.unitPrice.amount) * l.quantity,
    0,
  );
  return {
    totalQuantity,
    subtotal: { amount: amount.toFixed(2), currencyCode: currency },
  };
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<LocalCartLine[]>([]);
  const [couponCode, setCouponCode] = useState<string | null>(null);
  const [couponError, setCouponError] = useState<CouponError | null>(null);
  /** Discount as priced by the backend, when it did the pricing. Null means price locally. */
  const [serverDiscount, setServerDiscount] = useState<number | null>(null);
  /**
   * The coupon the backend approved. Needed because `findCoupon` only knows the local
   * registry: a code EchoDesk accepts but we've never heard of would otherwise leave
   * `coupon` null, and the applied-state chip — the only confirmation the shopper gets —
   * would never render. They'd see the field simply empty itself.
   */
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  /** Why the last code was rejected, as a translatable key. */
  const [couponReason, setCouponReason] = useState<PromoReason | null>(null);
  /** Spend threshold behind a `minimum` rejection, so the UI can name the actual figure. */
  const [couponMinSubtotal, setCouponMinSubtotal] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      // Wipe legacy versions so old image URLs (now banned hosts) can't crash the cart UI.
      for (const key of LEGACY_STORAGE_KEYS) localStorage.removeItem(key);

      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setLines(JSON.parse(raw) as LocalCartLine[]);

      const savedCoupon = localStorage.getItem(COUPON_STORAGE_KEY);
      if (savedCoupon) setCouponCode(savedCoupon);
    } catch {
      // ignore corrupted storage
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  }, [lines, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    if (couponCode) localStorage.setItem(COUPON_STORAGE_KEY, couponCode);
    else localStorage.removeItem(COUPON_STORAGE_KEY);
  }, [couponCode, hydrated]);

  // Cross-tab sync. `storage` events fire on every tab EXCEPT the one that triggered the
  // change — so when a user adds an item in Tab A, this listener picks it up in Tab B and
  // updates state without a refresh. Same for the coupon code.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.storageArea !== localStorage) return;
      if (e.key === STORAGE_KEY) {
        try {
          const next = e.newValue ? (JSON.parse(e.newValue) as LocalCartLine[]) : [];
          setLines(next);
        } catch {
          // ignore corrupted/foreign payloads
        }
      } else if (e.key === COUPON_STORAGE_KEY) {
        setCouponCode(e.newValue);
        // Clear any stale validation error inherited from this tab; the other tab is now
        // the source of truth on whether a coupon is applied.
        setCouponError(null);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const addLine = useCallback(
    (line: Omit<LocalCartLine, "quantity"> & { quantity?: number }) => {
      const qty = line.quantity ?? 1;
      setLines((prev) => {
        const idx = prev.findIndex((l) => l.variantId === line.variantId);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = { ...next[idx], quantity: next[idx].quantity + qty };
          return next;
        }
        return [...prev, { ...line, quantity: qty }];
      });
      // Deliberately does NOT open the drawer. Interrupting the browse flow to show a
      // cart the user didn't ask for costs more than it confirms; the count badge nudging
      // in the header / bottom nav carries the acknowledgement instead.
    },
    [],
  );

  const updateQuantity = useCallback((variantId: string, quantity: number) => {
    setLines((prev) =>
      quantity <= 0
        ? prev.filter((l) => l.variantId !== variantId)
        : prev.map((l) => (l.variantId === variantId ? { ...l, quantity } : l)),
    );
  }, []);

  const removeLine = useCallback((variantId: string) => {
    setLines((prev) => prev.filter((l) => l.variantId !== variantId));
  }, []);

  const clear = useCallback(() => {
    setLines([]);
    setCouponCode(null);
    setServerDiscount(null);
    setAppliedCoupon(null);
    setCouponError(null);
    setCouponReason(null);
  }, []);

  const totals = useMemo(() => computeTotals(lines), [lines]);

  // `findCoupon` returns a reference into the module-level registry, so this stays stable
  // across renders as long as the code does.
  const coupon = appliedCoupon ?? (couponCode ? findCoupon(couponCode) : null);
  const subtotalNum = Number.parseFloat(totals.subtotal.amount);
  // When the backend priced the code, its number wins. It is the one that will actually be
  // charged, and recomputing locally from a registry the backend doesn't share would let the
  // cart advertise a discount checkout won't honour.
  const discountAmount =
    serverDiscount !== null ? Math.min(serverDiscount, subtotalNum) : coupon ? discountFor(subtotalNum, coupon) : 0;
  const totalNum = Math.max(0, subtotalNum - discountAmount);
  const currencyCode = totals.subtotal.currencyCode;

  // Memoised on primitives. Built inline these were fresh objects every render, which put a
  // never-equal value in the context `useMemo` below — so every cart consumer in the tree
  // re-rendered on every provider render.
  const discount: Money = useMemo(
    () => ({ amount: discountAmount.toFixed(2), currencyCode }),
    [discountAmount, currencyCode],
  );
  const total: Money = useMemo(
    () => ({ amount: totalNum.toFixed(2), currencyCode }),
    [totalNum, currencyCode],
  );

  // Asks the server, so the cart gets exactly the answer checkout will give later — a code
  // accepted here and refused at checkout is the worst version of this feature.
  const applyCoupon = useCallback(
    async (code: string) => {
      const result = await checkPromoAction(code, subtotalNum).catch(() => null);
      if (!result || result.status === "unavailable") {
        // Couldn't reach the backend — distinct from a bad code, so say so rather than
        // telling someone their valid code is invalid.
        setCouponError("unavailable");
        setCouponReason(null);
        setCouponMinSubtotal(null);
        return false;
      }
      if (result.status === "invalid") {
        setCouponError(result.reason === "minimum" ? "minimum" : "invalid");
        setCouponMinSubtotal(result.minSubtotal ?? null);
        // Keep *why* — minimum spend, expiry, already used. That's the difference between
        // "this code isn't valid" and something the shopper can act on.
        setCouponReason(result.reason);
        return false;
      }
      setCouponCode(result.code);
      setServerDiscount(result.discount);
      // Represent it as a fixed amount: the backend gave us money, not a rule, and inventing
      // a percentage from it would misreport the offer.
      setAppliedCoupon({ code: result.code, type: "amount", value: result.discount });
      setCouponError(null);
      setCouponReason(null);
      setCouponMinSubtotal(null);
      return true;
    },
    [subtotalNum],
  );

  const removeCoupon = useCallback(() => {
    setCouponCode(null);
    setServerDiscount(null);
    setAppliedCoupon(null);
    setCouponError(null);
    setCouponReason(null);
  }, []);

  const clearCouponError = useCallback(() => {
    setCouponError(null);
    setCouponReason(null);
    setCouponMinSubtotal(null);
  }, []);

  const value = useMemo(
    () => ({
      lines,
      ...totals,
      coupon,
      discount,
      total,
      couponError,
      couponReason,
      couponMinSubtotal,
      addLine,
      updateQuantity,
      removeLine,
      clear,
      applyCoupon,
      removeCoupon,
      clearCouponError,
      open,
      setOpen,
    }),
    [
      lines,
      totals,
      coupon,
      discount,
      total,
      couponError,
      couponReason,
      couponMinSubtotal,
      addLine,
      updateQuantity,
      removeLine,
      clear,
      applyCoupon,
      removeCoupon,
      clearCouponError,
      open,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
