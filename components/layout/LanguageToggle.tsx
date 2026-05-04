"use client";

import { usePathname, useRouter } from "@/lib/i18n/routing";
import { locales, type Locale } from "@/lib/i18n/config";

export function LanguageToggle({ locale }: { locale: Locale }) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div
      className="flex items-center text-[11px] font-medium tracking-[0.18em] uppercase"
      role="group"
      aria-label="Language"
    >
      {locales.map((l, i) => (
        <button
          key={l}
          type="button"
          onClick={() => router.replace(pathname, { locale: l })}
          className="cursor-pointer px-1.5 py-2 transition-opacity"
          style={{
            opacity: l === locale ? 1 : 0.4,
            color: "var(--color-brand-ink)",
          }}
          aria-current={l === locale ? "true" : undefined}
        >
          {l.toUpperCase()}
          {i < locales.length - 1 ? <span className="ml-1.5 opacity-30">/</span> : null}
        </button>
      ))}
    </div>
  );
}
