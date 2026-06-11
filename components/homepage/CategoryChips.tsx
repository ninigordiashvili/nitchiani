"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/lib/i18n/routing";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  { href: "/shop", labelKey: "allProducts" as const },
  { href: "/shop/best-sellers", labelKey: "bestSellers" as const },
  { href: "/shop/new-arrivals", labelKey: "newArrivals" as const },
  { href: "/shop/bonnets", labelKey: "bonnets" as const },
  { href: "/shop/loc-care", labelKey: "locCare" as const },
  { href: "/shop/extensions", labelKey: "extensions" as const },
  { href: "/shop/accessories", labelKey: "accessories" as const },
  { href: "/shop/tools", labelKey: "tools" as const },
  { href: "/shop/piercings", labelKey: "piercings" as const },
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
      {CATEGORIES.map((c) => {
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
