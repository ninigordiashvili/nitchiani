"use client";

import { Building2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useId, useRef, useState } from "react";
import { cityName, searchCities, type GeorgianCity } from "@/lib/checkout/georgian-cities";
import { cn } from "@/lib/utils";

const inputCls =
  "w-full rounded-md border border-black/15 bg-white/60 px-3 py-2.5 text-sm focus:border-[var(--color-brand-ink)] focus:outline-none";

/**
 * City combobox for checkout, deliberately shaped like `AddressPicker`'s dropdown so the two
 * fields read as one family — same list, same highlight, same keyboard.
 *
 * The list only suggests. Whatever is typed is kept, because Georgia's villages are not in
 * `GEORGIAN_CITIES` and a required field that rejects a real place name loses the order.
 */
export function CityPicker({
  value,
  onChange,
  onBlur,
  ariaInvalid,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  ariaInvalid?: boolean;
  className?: string;
}) {
  const t = useTranslations("checkout");
  const locale = useLocale();
  const listId = useId();
  const boxRef = useRef<HTMLDivElement>(null);

  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(-1);

  // Typing filters; an exact hit would otherwise keep the full list open under the field
  // it already answered, so a match on the current value collapses to nothing to show.
  const matches = searchCities(value);
  const exact = matches.length === 1 && cityName(matches[0], locale) === value.trim();
  const suggestions = exact ? [] : matches;

  // Click-away. The dropdown is absolutely positioned, so without this it survives a click
  // anywhere else on the form.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!boxRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const choose = (city: GeorgianCity) => {
    onChange(cityName(city, locale));
    setOpen(false);
    setHighlight(-1);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open || suggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => (h + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => (h <= 0 ? suggestions.length - 1 : h - 1));
    } else if (e.key === "Enter" && highlight >= 0) {
      // Only swallow Enter when a row is actually highlighted — otherwise it belongs to the
      // form, and a shopper who typed a village would find the button dead.
      e.preventDefault();
      choose(suggestions[highlight]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div ref={boxRef} className="relative">
      <input
        className={cn(inputCls, className)}
        aria-required
        aria-invalid={ariaInvalid}
        role="combobox"
        aria-expanded={open && suggestions.length > 0}
        aria-controls={listId}
        aria-autocomplete="list"
        autoComplete="off"
        value={value}
        placeholder={t("cityPlaceholder")}
        onFocus={() => setOpen(true)}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
          setHighlight(-1);
        }}
        onKeyDown={onKeyDown}
        onBlur={onBlur}
      />

      {open && suggestions.length > 0 ? (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-20 mt-1 w-full overflow-hidden rounded-md border border-black/15 bg-white shadow-lg"
        >
          {suggestions.map((city, i) => (
            <li key={city.en}>
              <button
                type="button"
                role="option"
                aria-selected={i === highlight}
                // `onMouseDown`, not `onClick`: the input's blur closes the list first and
                // the click would land on nothing.
                onMouseDown={(e) => {
                  e.preventDefault();
                  choose(city);
                }}
                onMouseEnter={() => setHighlight(i)}
                className={cn(
                  "flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-left text-sm",
                  i === highlight ? "bg-black/5" : "hover:bg-black/5",
                )}
              >
                <Building2 size={14} className="shrink-0 opacity-50" aria-hidden />
                <span className="min-w-0 truncate">{cityName(city, locale)}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
