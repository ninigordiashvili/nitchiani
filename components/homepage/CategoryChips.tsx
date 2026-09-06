"use client";

import { useTranslations } from "next-intl";
import { CATEGORIES } from "@/lib/categories";
import { Link, usePathname } from "@/lib/i18n/routing";
import { cn } from "@/lib/utils";

// Shop-all first, then the category set from lib/categories.
const CHIPS = [
  { href: "/shop", labelKey: "allProducts" },
  ...CATEGORIES.map((c) => ({ href: `/shop/${c.handle}`, labelKey: c.labelKey })),
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
      aria-label={t("browseCategories")}
    >
      {CHIPS.map((c) => {
        const isActive = pathname === c.href;
        return (
          <Link
            key={c.href}
            href={c.href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "flex-shrink-0 snap-start rounded-full border px-4 py-2 text-xs font-medium uppercase tracking-[0.14em] transition-colors",
              isActive
                ? "border-[var(--text-primary)] bg-[var(--text-primary)] text-[var(--surface)]"
                : "border-black/15 hover:bg-[var(--text-primary)] hover:text-[var(--surface)]",
            )}
          >
            {t(c.labelKey)}
          </Link>
        );
      })}
    </nav>
  );
}
