"use client";

import { Search, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useRef, useState, useTransition } from "react";
import { searchAction } from "@/app/actions/search";
import { ProductGrid } from "@/components/commerce/ProductGrid";
import type { Locale } from "@/lib/i18n/config";
import { Link } from "@/lib/i18n/routing";
import type { Product } from "@/lib/shopify/types";
import { useFocusTrap } from "@/lib/ui/use-focus-trap";
import { useOverlays } from "@/lib/ui/overlays";
import { useSwipeDismiss } from "@/lib/ui/use-swipe-dismiss";

const POPULAR = [
  { handle: "best-sellers", labelKey: "bestSellers" as const },
  { handle: "new-arrivals", labelKey: "newArrivals" as const },
  { handle: "bonnets", labelKey: "bonnets" as const },
  { handle: "loc-care", labelKey: "locCare" as const },
];

export function SearchOverlay() {
  const t = useTranslations();
  const locale = useLocale() as Locale;
  const overlays = useOverlays();
  const open = overlays.searchOpen;
  const onClose = () => overlays.setSearchOpen(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [isPending, startTransition] = useTransition();
  const { dragOffset, handlers } = useSwipeDismiss({
    direction: "up",
    onDismiss: onClose,
  });
  const overlayRef = useRef<HTMLElement>(null);
  useFocusTrap(overlayRef, open);

  // Body scroll lock + focus the input on open. Reset on close.
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      // Slight delay so the slide-in finishes before iOS triggers the keyboard.
      const id = setTimeout(() => inputRef.current?.focus(), 200);
      return () => {
        clearTimeout(id);
        document.body.style.overflow = "";
      };
    }
    setQuery("");
    setResults([]);
  }, [open]);

  // ESC closes the overlay.
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  // Debounced search — kick off the action 200ms after the last keystroke.
  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setResults([]);
      return;
    }
    const id = setTimeout(() => {
      startTransition(async () => {
        const r = await searchAction(trimmed, locale);
        setResults(r);
      });
    }, 200);
    return () => clearTimeout(id);
  }, [query, locale]);

  const trimmed = query.trim();
  const showEmpty = !trimmed;
  const showNoResults = !!trimmed && !isPending && results.length === 0;
  const showResults = !!trimmed && results.length > 0;

  return (
    <div
      aria-hidden={!open}
      className="fixed inset-0 z-50 transition-opacity"
      style={{ opacity: open ? 1 : 0, pointerEvents: open ? "auto" : "none" }}
    >
      <div
        className="absolute inset-0"
        style={{ background: "rgba(10,31,31,0.45)" }}
        onClick={onClose}
      />
      <aside
        ref={overlayRef}
        {...handlers}
        role="dialog"
        aria-modal="true"
        aria-label={t("search.placeholder")}
        className="absolute top-0 right-0 left-0 max-h-[90dvh] overflow-y-auto transition-transform duration-200 ease-[var(--ease-brand)]"
        style={{
          background: "var(--color-brand-cream)",
          transform: open
            ? dragOffset < 0
              ? `translateY(${dragOffset}px)`
              : "translateY(0)"
            : "translateY(-100%)",
          ...(dragOffset < 0 ? { transition: "none" } : {}),
        }}
      >
        <div className="container-shop py-4">
          <div className="flex items-center gap-3 border-b border-black/10 pb-3">
            <Search size={18} className="flex-shrink-0 opacity-60" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              type="search"
              autoComplete="off"
              placeholder={t("search.placeholder")}
              className="flex-1 bg-transparent text-base placeholder:opacity-50 focus:outline-none"
            />
            <button
              type="button"
              onClick={() => {
                if (query) {
                  // Has text → wipe it and keep the overlay open so the user can refine.
                  setQuery("");
                  inputRef.current?.focus();
                } else {
                  onClose();
                }
              }}
              aria-label={query ? t("search.clearAria") : t("search.closeAria")}
              className="-mr-2 flex h-10 w-10 cursor-pointer items-center justify-center"
            >
              <X size={20} />
            </button>
          </div>

          <div className="py-6">
            {showEmpty && (
              <>
                <p className="label-eyebrow mb-3">{t("search.popularEyebrow")}</p>
                <div className="flex flex-wrap gap-2">
                  {POPULAR.map((p) => (
                    <Link
                      key={p.handle}
                      href={`/shop/${p.handle}`}
                      onClick={onClose}
                      className="rounded-full border border-black/15 px-4 py-2 text-xs font-medium uppercase tracking-[0.14em] transition-colors hover:bg-[var(--color-brand-ink)] hover:text-[var(--color-brand-cream)]"
                    >
                      {t(`nav.${p.labelKey}`)}
                    </Link>
                  ))}
                </div>
              </>
            )}

            {showNoResults && (
              <div className="py-10 text-center">
                <p className="text-sm opacity-70">{t("search.noResults", { query: trimmed })}</p>
                <Link href="/shop" onClick={onClose} className="btn-ghost mt-5 inline-flex">
                  {t("search.noResultsCta")}
                </Link>
              </div>
            )}

            {showResults && (
              // Closing the overlay on click bubbles from any tap on a result card. The Link inside
              // the card handles navigation; this just clears the overlay state alongside it.
              <div onClick={onClose}>
                <ProductGrid products={results} />
              </div>
            )}
          </div>
        </div>
      </aside>
    </div>
  );
}
