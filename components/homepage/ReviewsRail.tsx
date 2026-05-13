"use client";

import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { useRef } from "react";
import { useTranslations } from "next-intl";
import { StarRating } from "@/components/commerce/StarRating";
import { Link } from "@/lib/i18n/routing";
import type { HomepageReview } from "@/lib/reviews";
import { cn } from "@/lib/utils";

/**
 * Horizontal carousel of testimonial cards. Mobile users swipe natively; desktop users get
 * prev/next arrows in the section header (hidden below `sm:` since touch handles it).
 *
 * The arrows call `scrollBy` with the first card's measured width — so card-width tweaks
 * don't require keeping a separate constant in sync. Smooth-scroll behavior leans on the
 * native API; no animation library involved.
 */
export function ReviewsRail({ reviews }: { reviews: HomepageReview[] }) {
  const t = useTranslations("home");
  const railRef = useRef<HTMLUListElement>(null);

  const scroll = (direction: 1 | -1) => {
    const el = railRef.current;
    if (!el) return;
    const firstCard = el.firstElementChild as HTMLElement | null;
    const cardWidth = firstCard?.getBoundingClientRect().width ?? 280;
    // Card width + 12px gap (matches the `gap-3` on the rail).
    el.scrollBy({ left: direction * (cardWidth + 12), behavior: "smooth" });
  };

  return (
    <section>
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <p className="label-eyebrow mb-1.5">{t("reviewsEyebrow")}</p>
          <h2 className="font-display text-2xl tracking-tight sm:text-3xl">
            {t("reviewsTitle")}
          </h2>
        </div>
        <div className="hidden flex-shrink-0 gap-2 sm:flex">
          <RailButton onClick={() => scroll(-1)} aria-label="Previous">
            <ChevronLeft size={16} />
          </RailButton>
          <RailButton onClick={() => scroll(1)} aria-label="Next">
            <ChevronRight size={16} />
          </RailButton>
        </div>
      </div>

      <ul
        ref={railRef}
        className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 sm:mx-0 sm:gap-4 sm:px-0"
      >
        {reviews.map((r) => (
          <li
            key={r.id}
            className="w-[280px] flex-shrink-0 snap-start sm:w-[320px]"
          >
            <ReviewCard review={r} />
          </li>
        ))}
      </ul>
    </section>
  );
}

function RailButton({
  onClick,
  children,
  ...rest
}: {
  onClick: () => void;
  children: React.ReactNode;
} & React.AriaAttributes) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-black/15 transition-colors",
        "hover:border-[var(--color-brand-ink)] hover:bg-[var(--color-brand-ink)] hover:text-[var(--color-brand-cream)]",
      )}
      {...rest}
    >
      {children}
    </button>
  );
}

function ReviewCard({ review }: { review: HomepageReview }) {
  return (
    <Link
      href={`/products/${review.productHandle}`}
      className="group flex h-full flex-col rounded-lg border border-black/10 p-5 transition-colors hover:border-black/30"
      style={{ background: "color-mix(in oklab, var(--color-brand-cream) 60%, white 40%)" }}
    >
      <div className="flex items-center justify-between">
        <StarRating
          value={review.rating}
          size={13}
          className="text-[var(--color-brand-maroon)]"
        />
        <Quote size={16} className="opacity-25" />
      </div>
      <p className="mt-3 line-clamp-5 text-sm leading-relaxed opacity-90">
        “{review.body}”
      </p>
      <div className="mt-4 border-t border-black/10 pt-3 text-xs">
        <p className="font-medium">{review.author}</p>
        <p className="opacity-60">{review.city}</p>
      </div>
    </Link>
  );
}
