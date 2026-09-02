import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/routing";
import { BLUR_DATA_URL } from "@/lib/images";
import { CATEGORIES } from "@/lib/categories";

export function CategoryCardGrid() {
  const t = useTranslations("categories");

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
      {CATEGORIES.map((c) => (
        <Link
          key={c.handle}
          href={`/shop/${c.handle}`}
          className="group relative block aspect-square overflow-hidden"
        >
          {/* A category without artwork yet gets a branded panel rather than a broken image —
              it reads as a deliberate tile instead of a loading failure. Drop a file into
              /public/categories and point `image` at it to replace this. */}
          {c.image ? (
            <Image
              src={c.image}
              alt={t(c.labelKey)}
              fill
              sizes="(min-width: 1024px) 25vw, 50vw"
              placeholder="blur"
              blurDataURL={BLUR_DATA_URL}
              className="object-cover transition-transform duration-500 ease-[var(--ease-brand)] group-hover:scale-105"
            />
          ) : (
            <div
              className="absolute inset-0 transition-transform duration-500 ease-[var(--ease-brand)] group-hover:scale-105"
              style={{ background: "var(--color-brand-ink)" }}
            />
          )}
          <div className="absolute inset-0 scrim-bottom" />
          <div className="absolute right-3 bottom-3 left-3">
            <p className="font-display text-xl text-[var(--color-brand-cream)] sm:text-2xl">
              {t(c.labelKey)}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}
