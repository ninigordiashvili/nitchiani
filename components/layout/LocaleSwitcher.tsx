"use client";

import { Check, ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useCurrency } from "@/lib/currency/store";
import { CURRENCY_SYMBOL, SUPPORTED_CURRENCIES, type Currency } from "@/lib/currency/rates";
import { locales, type Locale } from "@/lib/i18n/config";
import { usePathname, useRouter } from "@/lib/i18n/routing";
import { cn } from "@/lib/utils";

/**
 * Combined currency + language picker. Trigger is a quiet `KA ▾` text button; tapping opens
 * a list-style menu (native-app pattern) with the current selection marked by a maroon check.
 *
 * Native language names ("ქართული" / "English") instead of pill abbreviations — a Georgian
 * shopper who lands in EN should be able to recognise their language in their own script
 * without learning the ISO code first.
 */

const LANGUAGE_LABELS: Record<Locale, string> = {
  ka: "ქართული",
  en: "English",
};

const CURRENCY_LABELS: Record<Currency, string> = {
  GEL: "Georgian Lari",
  USD: "US Dollar",
};

export function LocaleSwitcher({ locale }: { locale: Locale }) {
  const t = useTranslations("nav");
  const router = useRouter();
  const pathname = usePathname();
  const { currency, setCurrency } = useCurrency();
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (!wrapperRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="true"
        aria-label={`${t("language")} · ${t("currency")}`}
        className="inline-flex h-9 cursor-pointer items-center gap-1 rounded-md px-2 text-xs font-medium uppercase tracking-[0.1em] transition-colors hover:bg-black/5"
      >
        <span>{locale}</span>
        <ChevronDown
          size={12}
          className={cn(
            "opacity-50 transition-transform duration-200",
            open && "rotate-180",
          )}
        />
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute top-full right-0 z-50 mt-2 w-56 overflow-hidden rounded-lg"
          style={{
            background: "var(--surface-elevated)",
            boxShadow: "0 4px 24px var(--border-soft), 0 0 0 1px var(--border-soft)",
          }}
        >
          <Section label={t("language")}>
            {locales.map((l) => (
              <Option
                key={l}
                active={l === locale}
                onClick={() => {
                  router.replace(pathname, { locale: l });
                  setOpen(false);
                }}
                primary={LANGUAGE_LABELS[l]}
                secondary={l.toUpperCase()}
              />
            ))}
          </Section>

          <div className="border-t border-black/5" />

          <Section label={t("currency")}>
            {SUPPORTED_CURRENCIES.map((c) => (
              <Option
                key={c}
                active={c === currency}
                onClick={() => {
                  setCurrency(c);
                  setOpen(false);
                }}
                primary={CURRENCY_LABELS[c]}
                secondary={`${CURRENCY_SYMBOL[c]} ${c}`}
              />
            ))}
          </Section>
        </div>
      ) : null}
    </div>
  );
}

function Section({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="p-1">
      <p className="px-3 pt-2 pb-1 text-[10px] font-medium uppercase tracking-[0.16em] opacity-50">
        {label}
      </p>
      {children}
    </div>
  );
}

function Option({
  active,
  onClick,
  primary,
  secondary,
}: {
  active: boolean;
  onClick: () => void;
  primary: string;
  secondary: string;
}) {
  return (
    <button
      type="button"
      role="menuitemradio"
      aria-checked={active}
      onClick={onClick}
      className="flex w-full cursor-pointer items-center justify-between rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-black/5"
    >
      <span className="flex flex-col">
        <span className={cn("leading-tight", active && "font-medium")}>{primary}</span>
        <span className="text-[11px] tabular-nums opacity-50">{secondary}</span>
      </span>
      {active ? (
        <Check
          size={14}
          className="flex-shrink-0"
          style={{ color: "var(--color-brand-maroon)" }}
        />
      ) : null}
    </button>
  );
}
