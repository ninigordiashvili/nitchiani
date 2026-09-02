import { getLocale, getTranslations } from "next-intl/server";
import { Monogram } from "./Monogram";
import { StarRating } from "./StarRating";
import { getReviewSummary, getReviewsForProduct } from "@/lib/reviews";
import type { Locale } from "@/lib/i18n/config";
import type { Product } from "@/lib/shopify/types";
import { getReviews } from "@/lib/echodesk/reviews";

function average(values: number[]): number {
  if (values.length === 0) return 0;
  return Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10;
}

export async function Reviews({
  handle,
  product,
}: {
  handle: string;
  /** Passed when available so live reviews can be fetched by the backend's product id. */
  product?: Product;
}) {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("reviews");

  // EchoDesk is the source once it's configured, even when it returns nothing: an empty
  // review list is the truth for a product nobody has reviewed yet, and falling back to the
  // sample map there would put invented testimonials under a real product.
  const live = product ? await getReviews(product.id) : null;
  const reviews = live ?? getReviewsForProduct(handle, locale);
  const summary =
    product?.reviewSummary ??
    (live
      ? { count: live.length, average: average(live.map((r) => r.rating)) }
      : getReviewSummary(handle));

  if (reviews.length === 0) return null;

  const dateFmt = new Intl.DateTimeFormat(locale === "ka" ? "ka-GE" : "en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <section
      id="reviews"
      className="container-shop mt-16 scroll-mt-20 border-t border-black/10 pt-10"
    >
      <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="label-eyebrow mb-2">{t("title")}</p>
          <div className="flex items-center gap-3">
            <span
              className="font-display text-3xl tabular-nums sm:text-4xl"
              style={{ color: "var(--color-brand-ink)" }}
            >
              {summary.average.toFixed(1)}
            </span>
            <StarRating
              value={summary.average}
              size={18}
              className="text-[var(--color-brand-maroon)]"
            />
          </div>
          <p className="mt-1 text-xs opacity-60">
            {t("count", { count: summary.count })}
          </p>
        </div>
      </header>

      <ul className="grid gap-6 sm:grid-cols-2">
        {reviews.map((r) => (
          <li
            key={r.id}
            className="border-l-2 border-[var(--color-brand-maroon)]/30 pl-4"
          >
            <div className="mb-2 flex items-center gap-2">
              <StarRating
                value={r.rating}
                size={12}
                className="text-[var(--color-brand-maroon)]"
              />
              <span className="text-xs opacity-60">
                {dateFmt.format(new Date(r.date))}
              </span>
            </div>
            <p className="text-sm leading-relaxed">{r.body}</p>
            <div className="mt-3 flex items-center gap-2.5 text-xs">
              <Monogram name={r.author} size={28} />
              <p className="opacity-70">
                <span className="font-medium opacity-100">{r.author}</span>
                <span className="mx-1 opacity-40">·</span>
                {r.city}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
