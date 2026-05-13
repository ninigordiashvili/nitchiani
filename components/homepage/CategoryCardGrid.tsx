import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/routing";
import { BLUR_DATA_URL } from "@/lib/images";

const CARDS = [
  {
    handle: "bonnets",
    labelKey: "bonnets" as const,
    image: "/categories/bonnets.png",
  },
  {
    handle: "loc-care",
    labelKey: "locCare" as const,
    image: "/categories/loc-care.png",
  },
  {
    handle: "extensions",
    labelKey: "extensions" as const,
    image: "/categories/extensions.png",
  },
  {
    handle: "accessories",
    labelKey: "accessories" as const,
    image: "/categories/accessories.png",
  },
];

export function CategoryCardGrid() {
  const t = useTranslations("categories");

  return (
    <div className="grid grid-cols-2 gap-2 sm:gap-4 lg:grid-cols-4">
      {CARDS.map((c) => (
        <Link
          key={c.handle}
          href={`/shop/${c.handle}`}
          className="group relative block aspect-square overflow-hidden"
        >
          <Image
            src={c.image}
            alt={t(c.labelKey)}
            fill
            sizes="(min-width: 1024px) 25vw, 50vw"
            placeholder="blur"
            blurDataURL={BLUR_DATA_URL}
            className="object-cover transition-transform duration-500 ease-[var(--ease-brand)] group-hover:scale-105"
          />
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
