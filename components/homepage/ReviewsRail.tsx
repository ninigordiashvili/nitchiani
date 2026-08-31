"use client";

import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { useRef } from "react";
import { useTranslations } from "next-intl";
import { Monogram } from "@/components/commerce/Monogram";
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
  const tNav = useTranslations("nav");
  const railRef = useRef<HTMLUListElement>(null);

  const scroll = (direction: 1 | -1) => {
    const el = railRef.current;
    if (!el) return;
    const firstCard = el.firstElementChild as HTMLElement | null;
    const cardWidth = firstCard?.getBoundingClientRect().width ?? 280;
    // Card width + 4px gap (matches the `gap-1` on the rail).
    el.scrollBy({ left: direction * (cardWidth + 4), behavior: "smooth" });
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
          <RailButton onClick={() => scroll(-1)} aria-label={tNav("previous")}>
            <ChevronLeft size={16} />
          </RailButton>
          <RailButton onClick={() => scroll(1)} aria-label={tNav("next")}>
            <ChevronRight size={16} />
          </RailButton>
        </div>
      </div>

      <ul
        ref={railRef}
        className="no-scrollbar -mx-4 flex snap-x snap-mandatory items-stretch gap-1 overflow-x-auto px-4 sm:mx-0 sm:gap-1.5 sm:px-0"
      >
        {reviews.map((r) => (
          <li
            key={r.id}
            className="flex w-[280px] flex-shrink-0 snap-start sm:w-[320px]"
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
        "hover:border-[var(--text-primary)] hover:bg-[var(--text-primary)] hover:text-[var(--surface)]",
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
      className="group flex w-full flex-col rounded-lg border border-black/10 p-5 transition-colors hover:border-black/30"
      style={{ background: "var(--surface-elevated)" }}
    >
      <div className="flex items-center justify-between">
        <StarRating
          value={review.rating}
          size={13}
          className="text-[var(--color-brand-maroon)]"
        />
        <Quote size={16} className="opacity-25" />
      </div>
      {/* `mb-3` mirrors the footer's `pt-3` so the rule sits centred in its own gap.
          It can't live on the footer as a margin: `mt-auto` is what pins the block to
          the bottom of a stretched card, and would overwrite it. Any leftover height
          still lands above the rule, which is what keeps footers aligned across the rail. */}
      <p className="mt-3 mb-3 line-clamp-2 text-sm leading-relaxed opacity-90">
        “{review.body}”
      </p>
      <div className="mt-auto flex items-center gap-2.5 border-t border-black/10 pt-3 text-xs">
        <Monogram name={review.author} size={28} />
        <div className="min-w-0">
          <p className="truncate font-medium">{review.author}</p>
          <p className="truncate opacity-60">{review.city}</p>
        </div>
      </div>
    </Link>
  );
}
