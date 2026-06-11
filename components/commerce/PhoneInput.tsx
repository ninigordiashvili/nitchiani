"use client";

import { ChevronDown } from "lucide-react";
import { forwardRef, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * International phone input with a country picker. Defaults to Georgia (+995) — the
 * primary market — but accepts diaspora numbers (US/UK/DE/IL/TR/RU/FR/IT/ES) and emits
 * canonical E.164 ("+<code><digits>") to the form value.
 *
 * For Georgian numbers the local digits auto-format to `5XX XX XX XX` (the convention
 * Georgians know). Other countries render plain grouped digits.
 *
 * Empty input emits "" so the form's `optional()` / regex validation behaves predictably.
 */

type Country = {
  /** Dial code prefix including the `+`. */
  code: string;
  /** ISO-friendly emoji flag. */
  flag: string;
  /** Display name. */
  name: string;
  /** Expected local-digits length (after the country code). Used for placeholder + light validation. */
  digits: number;
};

// Curated list — Georgia first as the primary market, then ordered by the diaspora and
// neighbours most likely to send orders or gifts into Tbilisi.
const COUNTRIES: Country[] = [
  { code: "+995", flag: "🇬🇪", name: "Georgia", digits: 9 },
  { code: "+1", flag: "🇺🇸", name: "United States", digits: 10 },
  { code: "+44", flag: "🇬🇧", name: "United Kingdom", digits: 10 },
  { code: "+49", flag: "🇩🇪", name: "Germany", digits: 11 },
  { code: "+33", flag: "🇫🇷", name: "France", digits: 9 },
  { code: "+39", flag: "🇮🇹", name: "Italy", digits: 10 },
  { code: "+34", flag: "🇪🇸", name: "Spain", digits: 9 },
  { code: "+972", flag: "🇮🇱", name: "Israel", digits: 9 },
  { code: "+90", flag: "🇹🇷", name: "Turkey", digits: 10 },
  { code: "+7", flag: "🇷🇺", name: "Russia", digits: 10 },
];

const DEFAULT_COUNTRY = COUNTRIES[0];

function digitsOnly(s: string, max: number): string {
  return s.replace(/\D/g, "").slice(0, max);
}

/** Georgia-style "555 12 34 56" grouping. Empty input → "". */
function formatGeorgian(digits: string): string {
  const parts: string[] = [];
  if (digits.length > 0) parts.push(digits.slice(0, 3));
  if (digits.length > 3) parts.push(digits.slice(3, 5));
  if (digits.length > 5) parts.push(digits.slice(5, 7));
  if (digits.length > 7) parts.push(digits.slice(7, 9));
  return parts.join(" ");
}

/** Generic XXX XXX XXXX-style grouping in chunks of 3. Used for non-GE countries. */
function formatGeneric(digits: string): string {
  const groups: string[] = [];
  for (let i = 0; i < digits.length; i += 3) groups.push(digits.slice(i, i + 3));
  return groups.join(" ");
}

/** Parse the form's canonical value back into a `{ country, localDigits }` pair. */
function parseCanonical(canonical: string | undefined): {
  country: Country;
  localDigits: string;
} {
  if (!canonical) return { country: DEFAULT_COUNTRY, localDigits: "" };
  // Longest-prefix match so "+995" wins over "+9".
  const match = [...COUNTRIES]
    .sort((a, b) => b.code.length - a.code.length)
    .find((c) => canonical.startsWith(c.code));
  if (!match) return { country: DEFAULT_COUNTRY, localDigits: canonical.replace(/\D/g, "") };
  return {
    country: match,
    localDigits: canonical.slice(match.code.length).replace(/\D/g, ""),
  };
}

type Props = {
  value?: string;
  onChange?: (canonical: string) => void;
  onBlur?: () => void;
  className?: string;
  placeholder?: string;
  "aria-invalid"?: boolean;
};

export const PhoneInput = forwardRef<HTMLInputElement, Props>(function PhoneInput(
  { value, onChange, onBlur, className, placeholder, "aria-invalid": invalid },
  ref,
) {
  // Mirror state internally so the user can change the country without losing the digits
  // they typed, and so a parent passing a canonical value back hydrates correctly.
  const { country: initialCountry, localDigits: initialDigits } = parseCanonical(value);
  const [country, setCountry] = useState<Country>(initialCountry);
  const [digits, setDigits] = useState(initialDigits);
  const [pickerOpen, setPickerOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  // If the parent updates `value` externally (e.g., a reset), sync our local state.
  useEffect(() => {
    const parsed = parseCanonical(value);
    setCountry(parsed.country);
    setDigits(parsed.localDigits);
  }, [value]);

  // Outside-click + Escape close the picker.
  useEffect(() => {
    if (!pickerOpen) return;
    const onDown = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setPickerOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPickerOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [pickerOpen]);

  const emit = (nextCountry: Country, nextDigits: string) => {
    onChange?.(nextDigits ? `${nextCountry.code}${nextDigits}` : "");
  };

  const pickCountry = (c: Country) => {
    setCountry(c);
    setPickerOpen(false);
    // Re-clamp existing digits to the new country's expected length so an over-long entry
    // doesn't silently linger.
    const clamped = digits.slice(0, c.digits);
    setDigits(clamped);
    emit(c, clamped);
  };

  const onDigitsChange = (raw: string) => {
    const next = digitsOnly(raw, country.digits);
    setDigits(next);
    emit(country, next);
  };

  const formatted =
    country.code === "+995" ? formatGeorgian(digits) : formatGeneric(digits);
  // Build a localised placeholder based on the current country's expected length.
  const inferredPlaceholder = placeholder ?? "0".repeat(country.digits).replace(/(\d{3})(?=\d)/g, "$1 ");

  return (
    <div ref={pickerRef} className={cn("relative", className)}>
      <div
        className={cn(
          "flex w-full items-stretch overflow-hidden rounded-md border border-black/15 bg-white/60 focus-within:border-[var(--color-brand-ink)]",
          invalid && "border-[var(--color-brand-maroon)]",
        )}
      >
        <button
          type="button"
          onClick={() => setPickerOpen((v) => !v)}
          aria-haspopup="listbox"
          aria-expanded={pickerOpen}
          aria-label={`${country.name} ${country.code}`}
          className="flex flex-shrink-0 cursor-pointer items-center gap-1.5 border-r border-black/10 bg-black/[0.03] px-2.5 text-sm tabular-nums transition-colors hover:bg-black/[0.06]"
        >
          <span aria-hidden="true">{country.flag}</span>
          <span>{country.code}</span>
          <ChevronDown size={12} className="opacity-60" />
        </button>
        <input
          ref={ref}
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          // Generous max — generic grouping adds spaces. The `digitsOnly` clamp is the
          // real guard.
          maxLength={country.digits + Math.ceil(country.digits / 3)}
          value={formatted}
          onChange={(e) => onDigitsChange(e.target.value)}
          onBlur={onBlur}
          placeholder={inferredPlaceholder}
          aria-invalid={invalid}
          className="flex-1 bg-transparent px-3 py-2.5 text-sm focus:outline-none"
        />
      </div>

      {pickerOpen ? (
        <ul
          role="listbox"
          aria-label="Country code"
          className="absolute top-full left-0 z-20 mt-1 max-h-72 w-64 overflow-y-auto rounded-md border shadow-lg"
          style={{
            background: "var(--surface-elevated)",
            borderColor: "var(--border-soft)",
          }}
        >
          {COUNTRIES.map((c) => {
            const selected = c.code === country.code && c.name === country.name;
            return (
              <li key={`${c.code}-${c.name}`}>
                <button
                  type="button"
                  role="option"
                  aria-selected={selected}
                  onClick={() => pickCountry(c)}
                  className={cn(
                    "flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-black/5",
                    selected && "bg-black/5",
                  )}
                >
                  <span className="flex-shrink-0" aria-hidden="true">
                    {c.flag}
                  </span>
                  <span className="flex-1">{c.name}</span>
                  <span className="tabular-nums opacity-70">{c.code}</span>
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
});
