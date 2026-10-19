import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/routing";
import { BLUR_DATA_URL } from "@/lib/images";
import { CATEGORIES } from "@/lib/categories";

export function CategoryCardGrid() {
  const t = useTranslations("categories");

  return (
    // `auto-fit` on the wide breakpoint rather than a fixed count. The grid was pinned to
    // five columns for the five categories that existed when it was written; hiding one
    // left a card-shaped hole on the right of the row. `auto-fit` lays out as many 200px
    // tracks as fit, collapses the empty ones and lets the rest share the width — so the
    // row fills edge to edge whether there are four categories or six.
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-4 lg:[grid-template-columns:repeat(auto-fit,minmax(200px,1fr))]">
      {CATEGORIES.map((c) => (
        <Link
          key={c.handle}
          href={`/shop/${c.handle}`}
          // The same warm hairline and radius as the product tiles and the contact cards.
          className="group relative block aspect-square overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border-card)] transition-[box-shadow,border-color] duration-300 ease-[var(--ease-brand)] hover:border-[var(--border-card-hover)] hover:shadow-[0_8px_28px_-10px_color-mix(in_oklab,var(--color-brand-maroon)_38%,transparent)]"
        >
          {/* A category without artwork yet gets a branded panel rather than a broken image —
              it reads as a deliberate tile instead of a loading failure. Drop a file into
              /public/categories and point `image` at it to replace this. */}
          {c.image ? (
            <Image
              src={c.image}
              alt={t(c.labelKey)}
              fill
              // The card, not the column: `gap-2` between two phone columns inside
              // `container-shop`'s `px-4`, `gap-4` between three at `sm`, and at `lg` the
              // `auto-fit` tracks settle to four 318px cards once the container reaches its
              // 1320px max-width.
              sizes="(min-width: 1384px) 318px, (min-width: 1024px) calc( 25vw - 28px ), (min-width: 640px) calc( 33.34vw - 26.7px ), calc( 50vw - 20px )"
              placeholder="blur"
              blurDataURL={BLUR_DATA_URL}
              className="object-cover transition-transform duration-500 ease-[var(--ease-brand)] group-hover:scale-[1.025]"
            />
          ) : (
            <div
              className="absolute inset-0 transition-transform duration-500 ease-[var(--ease-brand)] group-hover:scale-[1.025]"
              style={{ background: "var(--color-brand-ink)" }}
            />
          )}
          <div className="absolute inset-0 scrim-bottom" />
          <div className="absolute right-3 bottom-3 left-3">
            <p className="font-display on-photo text-xl text-[var(--color-brand-cream)] sm:text-2xl">
              {t(c.labelKey)}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}
