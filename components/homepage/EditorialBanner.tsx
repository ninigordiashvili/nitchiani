import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Link } from "@/lib/i18n/routing";
import { BLUR_DATA_URL } from "@/lib/images";

export function EditorialBanner({
  imageUrl,
  imageAlt,
  eyebrow,
  title,
  subtitle,
  ctaLabel,
  href,
}: {
  imageUrl: string;
  imageAlt: string;
  eyebrow?: string;
  title: string;
  subtitle?: string;
  ctaLabel: string;
  href: string;
}) {
  return (
    <Link href={href} className="relative block h-[240px] w-full overflow-hidden sm:h-[320px] lg:h-[380px]">
      <Image
        src={imageUrl}
        alt={imageAlt}
        fill
        sizes="100vw"
        placeholder="blur"
        blurDataURL={BLUR_DATA_URL}
        className="object-cover transition-transform duration-[400ms] ease-[var(--ease-brand)] hover:scale-[1.03]"
      />
      <div className="absolute inset-0 scrim-bottom" />
      <div className="absolute right-0 bottom-0 left-0 text-[var(--color-brand-cream)]">
        <div className="container-shop py-6 sm:py-10">
          {eyebrow ? <p className="label-eyebrow mb-2 text-[var(--color-brand-silver)]">{eyebrow}</p> : null}
          <h2 className="font-display text-3xl leading-[1.05] tracking-tight sm:text-5xl">{title}</h2>
          {subtitle ? <p className="mt-2 max-w-md text-sm opacity-85 sm:text-base">{subtitle}</p> : null}
          <span className="mt-4 inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em]">
            {ctaLabel}
            <ArrowRight size={14} />
          </span>
        </div>
      </div>
    </Link>
  );
}
