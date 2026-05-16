"use client";

import { Sparkles, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useCart } from "@/lib/cart/store";
import { usePathname } from "@/lib/i18n/routing";
import { useFocusTrap } from "@/lib/ui/use-focus-trap";
import { useSwipeDismiss } from "@/lib/ui/use-swipe-dismiss";

/**
 * First-visit welcome popup. Fires once after 15s of activity, offers the WELCOME10 code,
 * and persists a dismissal flag so returning users never see it again. Skipped on `/checkout`
 * so it can't slide in over a user mid-purchase.
 *
 * Tapping "Apply to cart" runs `cart.applyCoupon("WELCOME10")` directly — the code is also
 * registered in `lib/cart/coupons.ts`, so this is a true end-to-end discount, not just a chip.
 */

const STORAGE_KEY = "nitchiani:welcome:dismissed:v1";
const DELAY_MS = 15000;
const CODE = "WELCOME10";

export function WelcomePopup() {
  const t = useTranslations("welcome");
  const cart = useCart();
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const { dragOffset, handlers } = useSwipeDismiss({
    direction: "down",
    onDismiss: () => dismiss(),
    maxViewportWidth: 640,
  });
  const modalRef = useRef<HTMLDivElement>(null);
  useFocusTrap(modalRef, visible);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (pathname.startsWith("/checkout")) return;
    try {
      if (localStorage.getItem(STORAGE_KEY)) return;
    } catch {
      // ignore — if storage is blocked, just behave as first-visit
    }

    let pendingId: number | undefined;

    // Every modal/drawer in the app locks `body.style.overflow = "hidden"` on open. If the
    // user has another modal up (cart drawer, size guide, search overlay, "How it works",
    // etc.) when the 15s timer fires, we'd stack the welcome popup on top — which looks
    // broken and burns the once-per-customer dismissal flag on an invisible appearance.
    // Defer until the body lock clears.
    const tryShow = () => {
      if (document.body.style.overflow === "hidden") {
        pendingId = window.setTimeout(tryShow, 1000);
        return;
      }
      setVisible(true);
    };

    pendingId = window.setTimeout(tryShow, DELAY_MS);

    return () => {
      if (pendingId !== undefined) clearTimeout(pendingId);
    };
  }, [pathname]);

  useEffect(() => {
    if (!visible) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") dismiss();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
    // dismiss is stable via closure; eslint-disable not needed here in practice but kept
    // dependency-light to avoid re-attaching the keyboard listener on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const dismiss = () => {
    setVisible(false);
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // ignore
    }
  };

  const apply = () => {
    cart.applyCoupon(CODE);
    dismiss();
    if (cart.lines.length > 0) cart.setOpen(true);
  };

  return (
    <div
      aria-hidden={!visible}
      className="fixed inset-0 z-50 transition-opacity"
      style={{ opacity: visible ? 1 : 0, pointerEvents: visible ? "auto" : "none" }}
    >
      <div
        className="absolute inset-0"
        style={{ background: "rgba(10,31,31,0.55)" }}
        onClick={dismiss}
      />
      <div
        ref={modalRef}
        {...handlers}
        role="dialog"
        aria-modal="true"
        aria-label={t("title")}
        className="absolute right-0 bottom-0 left-0 rounded-t-2xl transition-transform duration-200 ease-[var(--ease-brand)] sm:right-1/2 sm:bottom-1/2 sm:left-1/2 sm:w-[min(440px,92vw)] sm:translate-x-[-50%] sm:translate-y-[50%] sm:rounded-2xl"
        style={{
          background: "var(--color-brand-cream)",
          transform: visible
            ? dragOffset > 0
              ? `translateY(${dragOffset}px)`
              : undefined
            : "translateY(100%)",
          ...(dragOffset > 0 ? { transition: "none" } : {}),
        }}
      >
        <button
          type="button"
          onClick={dismiss}
          aria-label="Close"
          className="absolute top-3 right-3 flex h-9 w-9 cursor-pointer items-center justify-center"
        >
          <X size={18} />
        </button>

        <div className="px-6 py-8 text-center sm:px-8">
          <span
            className="inline-flex h-12 w-12 items-center justify-center rounded-full"
            style={{
              background:
                "color-mix(in oklab, var(--color-brand-maroon) 12%, transparent)",
              color: "var(--color-brand-maroon)",
            }}
          >
            <Sparkles size={22} />
          </span>
          <p className="label-eyebrow mt-4">{t("eyebrow")}</p>
          <h2 className="font-display mt-2 text-3xl leading-tight tracking-tight">
            {t("title")}
          </h2>
          <p className="mt-2 text-sm opacity-70">{t("subtitle")}</p>

          <div
            className="mt-5 inline-flex items-center justify-center rounded-md border-2 border-dashed px-5 py-3"
            style={{
              borderColor: "var(--color-brand-maroon)",
              color: "var(--color-brand-maroon)",
            }}
          >
            <span className="text-lg font-medium tracking-[0.2em] tabular-nums">
              {CODE}
            </span>
          </div>

          <button type="button" onClick={apply} className="btn-primary mt-5 w-full">
            {t("apply")}
          </button>

          <p className="mt-3 text-xs opacity-50">{t("fineprint")}</p>
        </div>
      </div>
    </div>
  );
}
