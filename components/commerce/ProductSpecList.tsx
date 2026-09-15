import { useTranslations } from "next-intl";
import type { ProductAttribute } from "@/lib/shopify/types";

/**
 * The short spec list beside the price — length, colour, texture, whatever the product carries.
 *
 * It repeats what the details tab says further down, deliberately. These are the facts a
 * shopper checks *before* deciding to read anything: the ones that rule a product out. Making
 * them scroll past the buy button to find the length is how a sale is lost to a competitor
 * whose page said "55 cm" above the fold.
 *
 * Built from the same attributes as the data sheet, so the two can never disagree.
 */
export function ProductSpecList({
  attributes,
  /** How many to show before the price. Seven bullets is not a glance — it is a wall the
   *  shopper reads past to reach the buy button, and on a phone it is most of a screen.
   *  The rest are not lost: every attribute still appears in the details tab below. Order
   *  comes from EchoDesk's `sort_order`, so which ones make the cut is the merchant's call. */
  limit = 4,
}: {
  attributes?: ProductAttribute[];
  limit?: number;
}) {
  const t = useTranslations("product");
  const specs = (attributes ?? []).filter((a) => a.values.length > 0).slice(0, limit);
  if (specs.length === 0) return null;

  return (
    <ul
      aria-label={t("specifications")}
      className="mt-4 grid list-disc gap-1 pl-5 text-sm marker:opacity-40"
    >
      {specs.map((a) => (
        <li key={a.key}>
          <span className="opacity-65">{a.name}:</span> {a.values.join(", ")}
        </li>
      ))}
    </ul>
  );
}
