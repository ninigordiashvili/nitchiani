"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";

/**
 * Georgian-prefix phone input. Visual `+995` adornment is non-editable; the input itself
 * holds a 9-digit local mobile number that auto-formats as `5XX XX XX XX` while the user types.
 *
 * The exposed form value is always canonical: `+995XXXXXXXXX` (or empty during typing).
 * Server/Shopify gets a clean E.164-shaped string with no spaces.
 */

/** Strip non-digits and clamp to 9 digits (Georgian mobile after +995). */
function digitsOnly(s: string): string {
  return s.replace(/\D/g, "").slice(0, 9);
}

/** "555123456" → "555 12 34 56". Returns "" for empty input. */
function formatLocal(digits: string): string {
  const parts: string[] = [];
  if (digits.length > 0) parts.push(digits.slice(0, 3));
  if (digits.length > 3) parts.push(digits.slice(3, 5));
  if (digits.length > 5) parts.push(digits.slice(5, 7));
  if (digits.length > 7) parts.push(digits.slice(7, 9));
  return parts.join(" ");
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
  { value, onChange, onBlur, className, placeholder = "5XX XX XX XX", ...rest },
  ref,
) {
  const digits = digitsOnly(value ?? "");
  const formatted = formatLocal(digits);

  return (
    <div
      className={cn(
        "flex w-full items-stretch overflow-hidden rounded-md border border-black/15 bg-white/60 focus-within:border-[var(--color-brand-ink)]",
        className,
      )}
    >
      <span
        className="flex items-center border-r border-black/10 bg-black/[0.03] px-3 text-sm tabular-nums"
        aria-hidden="true"
      >
        +995
      </span>
      <input
        ref={ref}
        type="tel"
        inputMode="numeric"
        autoComplete="tel-national"
        // 12 chars covers "555 00 00 00"; the digitsOnly clamp is the real guard.
        maxLength={12}
        value={formatted}
        onChange={(e) => {
          const next = digitsOnly(e.target.value);
          onChange?.(next.length > 0 ? `+995${next}` : "");
        }}
        onBlur={onBlur}
        placeholder={placeholder}
        className="flex-1 bg-transparent px-3 py-2.5 text-sm focus:outline-none"
        {...rest}
      />
    </div>
  );
});
