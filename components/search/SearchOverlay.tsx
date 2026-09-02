"use client";

import { ArrowRight, Search, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { searchAction } from "@/app/actions/search";
import { CATEGORIES } from "@/lib/categories";
import { ProductGrid } from "@/components/commerce/ProductGrid";
import type { Locale } from "@/lib/i18n/config";
import { Link } from "@/lib/i18n/routing";
import type { Product } from "@/lib/shopify/types";
import { useFocusTrap } from "@/lib/ui/use-focus-trap";
import { useOverlays } from "@/lib/ui/overlays";
import { useSwipeDismiss } from "@/lib/ui/use-swipe-dismiss";

// Shortcuts shown on an empty search. Taken from the shared category list rather than a
// hand-written pair, which is how this ended up still pointing at loc-care after the set was
// renamed. First two only — the panel is a quick nudge, not a second navigation.
const POPULAR = CATEGORIES.slice(0, 2);

export function SearchOverlay() {
  const t = useTranslations();
  const locale = useLocale() as Locale;
  const overlays = useOverlays();
  const open = overlays.searchOpen;
  const setSearchOpen = overlays.setSearchOpen;
  // Stable identity: the ESC-key effect below lists `onClose` as a dependency, so an inline
  // arrow would tear down and re-register the keydown listener on every render.
  const onClose = useCallback(() => setSearchOpen(false), [setSearchOpen]);
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

  // Safety net: close on any navigation.
  //
  // The results grid below closes the overlay by catching bubbled clicks, which covers the
  // ordinary "tap a result" path and does it instantly, before the route resolves. But any
  // link that stops propagation on the way up escapes it — the quick-view sheet's "View full
  // details" did exactly that until it was taught to close the overlay itself. Watching the
  // path means a route change can never strand the panel open over the new page, whatever
  // route it out.
  //
  // `next/navigation`'s pathname is the real, locale-prefixed URL, so a locale switch counts
  // as a navigation here too — also correct, since the results were fetched for the old one.
  const pathname = usePathname();
  const lastPathRef = useRef(pathname);
  useEffect(() => {
    if (pathname === lastPathRef.current) return;
    lastPathRef.current = pathname;
    setSearchOpen(false);
  }, [pathname, setSearchOpen]);

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

  // "View all <type>" target. Search returns a mix, so pick the type that actually dominates
  // the results and offer its collection. Requiring at least half guards against slapping a
  // confident "View all Bonnets" on a 4-bonnet / 4-tool split, where the label would be a
  // coin flip.
  //
  // `productTypeHandle` is the stable English-derived slug ("Loc Care" -> "loc-care") and every
  // one of them is an existing /shop collection, so it can be linked straight through;
  // `productType` alongside it is already localised for the label.
  const dominantType = useMemo(() => {
    if (results.length === 0) return null;
    const counts = new Map<string, { count: number; label: string }>();
    for (const p of results) {
      const entry = counts.get(p.productTypeHandle);
      if (entry) entry.count += 1;
      else counts.set(p.productTypeHandle, { count: 1, label: p.productType });
    }
    let top: { handle: string; count: number; label: string } | null = null;
    for (const [handle, { count, label }] of counts) {
      if (!top || count > top.count) top = { handle, count, label };
    }
    return top && top.count * 2 >= results.length ? top : null;
  }, [results]);

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
          background: "var(--surface)",
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
                      className="rounded-full border border-black/15 px-4 py-2 text-xs font-medium uppercase tracking-[0.14em] transition-colors hover:bg-[var(--text-primary)] hover:text-[var(--surface)]"
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
                {dominantType ? (
                  <div className="mb-4 text-center">
                    <Link
                      href={`/shop/${dominantType.handle}`}
                      className="btn-ghost inline-flex"
                    >
                      {t("search.viewAllType", { type: dominantType.label })}
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                ) : null}
                <ProductGrid products={results} />
              </div>
            )}
          </div>
        </div>
      </aside>
    </div>
  );
}
