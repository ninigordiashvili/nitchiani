"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/lib/i18n/routing";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  { handle: "best-sellers", labelKey: "bestSellers" as const },
  { handle: "new-arrivals", labelKey: "newArrivals" as const },
  { handle: "bonnets", labelKey: "bonnets" as const },
  { handle: "loc-care", labelKey: "locCare" as const },
  { handle: "extensions", labelKey: "extensions" as const },
  { handle: "accessories", labelKey: "accessories" as const },
  { handle: "tools", labelKey: "tools" as const },
];

export function CategoryChips() {
  const t = useTranslations("nav");
  const pathname = usePathname();

  return (
    <nav
      // 20px of visible space above and below the chip pills, symmetric.
      // Top: `mt-4` (16) + `pt-1` (4) = 20.
      // Bottom: `pb-1` (4) + `mt-4` (16) on the next section = 20.
      className="container-shop no-scrollbar mt-4 flex snap-x snap-mandatory items-center gap-2 overflow-x-auto py-1"
      aria-label="Browse categories"
    >
      {CATEGORIES.map((c) => {
        const href = `/shop/${c.handle}`;
        const isActive = pathname === href;
        return (
          <Link
            key={c.handle}
            href={href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "flex-shrink-0 snap-start rounded-full border px-4 py-2 text-xs font-medium uppercase tracking-[0.14em] transition-colors",
              isActive
                ? "border-[var(--color-brand-ink)] bg-[var(--color-brand-ink)] text-[var(--color-brand-cream)]"
                : "border-black/15 hover:bg-[var(--color-brand-ink)] hover:text-[var(--color-brand-cream)]",
            )}
          >
            {t(c.labelKey)}
          </Link>
        );
      })}
    </nav>
  );
}
