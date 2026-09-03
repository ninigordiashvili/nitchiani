import type { Locale } from "../i18n/config";
import type { Product, ProductAttribute, ProductVariant } from "../shopify/types";
import type { EchoDeskAttributeValue, EchoDeskProduct, LocalizedText } from "./types";

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
          value: typeof a.value === "string" ? a.value : (a.value_text ?? ""),
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

  const attributes = adaptAttributes(p.attribute_values, locale);
  // Deliberately blank: `productType` used to borrow the first attribute's name, which with
  // real attributes means a filter label ("Hair type") leaking into the PDP eyebrow as if it
  // were a category. Category membership lives in lib/echodesk/categories.ts instead.
  const productType = "";

  return {
    id: `gid://echodesk/Product/${p.id}`,
    handle: p.slug,
    title,
    description: pick(p.description, locale) || pick(p.short_description, locale),
    tags: [],
    vendor: "Nitchiani",
    productType,
    // Locale-stable slug for breadcrumb/category links, mirroring the sample catalog's rule.
    productTypeHandle: "",
    featuredImage: featured,
    images: gallery.length ? gallery : [featured],
    options: [...optionMap].map(([name, values]) => ({ name, values: [...values] })),
    variants,
    priceRange: {
      min: { amount: Math.min(...prices).toFixed(2), currencyCode: CURRENCY },
      max: { amount: Math.max(...prices).toFixed(2), currencyCode: CURRENCY },
    },
    isBestSeller: p.is_featured || undefined,
    attributes: attributes.length > 0 ? attributes : undefined,
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

/**
 * Turns EchoDesk attribute values into the storefront's filter shape.
 *
 * Only `is_filterable` attributes are kept, and only those that actually resolve to a value —
 * the tenant currently has one declared as a `number` with no options and an empty value,
 * which would otherwise render an empty chip group. A filter you can't filter by is worse
 * than no filter.
 *
 * Multiselect values arrive as an array of option keys; each is mapped back to its localized
 * label via the attribute's own `options`, falling back to the raw key when there's no match.
 */
export function adaptAttributes(
  raw: EchoDeskAttributeValue[] | undefined,
  locale: Locale,
): ProductAttribute[] {
  const out: ProductAttribute[] = [];

  for (const entry of raw ?? []) {
    const attr = entry.attribute;
    if (!attr?.key || attr.is_filterable === false) continue;

    const label = (keyOrValue: unknown): string => {
      const asKey = String(keyOrValue ?? "").trim();
      if (!asKey) return "";
      const match = attr.options?.find((o) => o.value === asKey);
      return match ? pick(match, locale) || asKey : asKey;
    };

    const values = (
      Array.isArray(entry.value)
        ? entry.value.map(label)
        : [label(entry.value ?? entry.value_text)]
    ).filter(Boolean);

    if (values.length === 0) continue;
    out.push({ key: attr.key, name: pick(attr.name, locale) || attr.key, values });
  }

  return out;
}
