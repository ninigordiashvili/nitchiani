import type { Locale } from "../i18n/config";
import type { Product, ProductVariant } from "../shopify/types";
import type { EchoDeskProduct, LocalizedText } from "./types";

/**
 * Maps EchoDesk records onto the storefront's own `Product` shape.
 *
 * Everything downstream — cards, PDP, cart, quick view, search — is written against that
 * shape, so translating at the boundary means the backend swap costs no component changes.
 * It also keeps the sample catalog and the live one interchangeable, which is what lets the
 * site keep working while the tenant is still being filled in.
 *
 * The numeric EchoDesk id is preserved inside the variant GID (`gid://echodesk/Variant/<id>`)
 * because cart, checkout and shipping-quote calls all key on it — losing it here would mean
 * a second lookup at checkout.
 */

const CURRENCY = "GEL";

/** EchoDesk sends `{en, ka}`; fall back through locale → English → any value → "". */
export function pick(text: LocalizedText | undefined, locale: Locale): string {
  if (!text) return "";
  return text[locale] || text.en || Object.values(text).find(Boolean) || "";
}

function money(amount: string | null | undefined) {
  return { amount: Number.parseFloat(amount ?? "0").toFixed(2), currencyCode: CURRENCY };
}

export function adaptProduct(p: EchoDeskProduct, locale: Locale): Product {
  const title = pick(p.name, locale);
  const gallery = (p.images ?? [])
    .slice()
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
    .map((img, i) => ({
      url: img.image,
      altText: img.alt_text || `${title} — view ${i + 1}`,
      width: 900,
      height: 1125,
    }));

  // The list serialiser sends only a single `image`; the detail one sends `images`.
  const featured = gallery[0] ?? {
    url: p.image ?? "/products/gold-wax.png",
    altText: title,
    width: 900,
    height: 1125,
  };

  const inStock = p.is_in_stock ?? (p.quantity ?? 0) > 0;

  // A product with no variants still needs one sellable row — the storefront always adds a
  // variant to the bag, never a bare product.
  const variants: ProductVariant[] = (p.variants ?? []).length
    ? p.variants!.map((v) => ({
        id: `gid://echodesk/Variant/${v.id}`,
        title: pick(v.name, locale) || "One Size",
        availableForSale: v.is_in_stock ?? (v.quantity ?? 0) > 0,
        selectedOptions: (v.attribute_values ?? []).map((a) => ({
          name: pick(a.attribute?.name, locale),
          value: a.value ?? "",
        })),
        price: money(v.price ?? p.price),
        compareAtPrice: v.compare_at_price ? money(v.compare_at_price) : undefined,
      }))
    : [
        {
          // Tagged Product, not Variant: this row stands in for a product that has no
          // variants of its own, and checkout must send it as `product_id` with no
          // `variant_id`. Encoding it as a Variant would post the product id in the wrong
          // field and the order would be rejected.
          id: `gid://echodesk/Product/${p.id}`,
          title: "One Size",
          availableForSale: inStock,
          selectedOptions: [],
          price: money(p.price),
          compareAtPrice: p.compare_at_price ? money(p.compare_at_price) : undefined,
        },
      ];

  const prices = variants.map((v) => Number.parseFloat(v.price.amount));

  // Option groups are derived from the variants' own attributes rather than read separately,
  // so the picker can never offer a combination that has no variant behind it.
  const optionMap = new Map<string, Set<string>>();
  for (const v of variants) {
    for (const o of v.selectedOptions) {
      if (!o.name) continue;
      if (!optionMap.has(o.name)) optionMap.set(o.name, new Set());
      optionMap.get(o.name)!.add(o.value);
    }
  }

  const productType = pick(p.attribute_values?.find((a) => a.attribute)?.attribute?.name, locale);

  return {
    id: `gid://echodesk/Product/${p.id}`,
    handle: p.slug,
    title,
    description: pick(p.description, locale) || pick(p.short_description, locale),
    tags: [],
    vendor: "Nitchiani",
    productType,
    // Locale-stable slug for breadcrumb/category links, mirroring the sample catalog's rule.
    productTypeHandle: (pick(p.attribute_values?.find((a) => a.attribute)?.attribute?.name, "en") || "")
      .toLowerCase()
      .replace(/\s+/g, "-"),
    featuredImage: featured,
    images: gallery.length ? gallery : [featured],
    options: [...optionMap].map(([name, values]) => ({ name, values: [...values] })),
    variants,
    priceRange: {
      min: { amount: Math.min(...prices).toFixed(2), currencyCode: CURRENCY },
      max: { amount: Math.max(...prices).toFixed(2), currencyCode: CURRENCY },
    },
    isBestSeller: p.is_featured || undefined,
    // The list and detail payloads both carry these, so a card can show a real rating
    // without a second request per product.
    reviewSummary:
      typeof p.review_count === "number" && p.review_count > 0
        ? {
            count: p.review_count,
            average: Math.round((p.average_rating ?? 0) * 10) / 10,
          }
        : undefined,
  };
}

/**
 * Reads an EchoDesk reference back out of a cart line's id.
 *
 * `gid://echodesk/Variant/12` → { kind: "variant", id: 12 }
 * `gid://echodesk/Product/12` → { kind: "product", id: 12 }
 *
 * Checkout needs the distinction: a variant row sends both `product_id` and `variant_id`,
 * a product row sends `product_id` alone.
 */
export function parseEchoDeskGid(
  gid: string,
): { kind: "product" | "variant"; id: number } | null {
  const m = /^gid:\/\/echodesk\/(Product|Variant)\/(\d+)$/.exec(gid);
  if (!m) return null;
  return { kind: m[1] === "Product" ? "product" : "variant", id: Number.parseInt(m[2], 10) };
}
