/**
 * The storefront's category set — one definition, used everywhere.
 *
 * EchoDesk exposes no categories (`categories/` 404s, `item-lists` is empty), so this is
 * declared here rather than fetched. It previously lived duplicated across the chip row, the
 * homepage card grid, the mobile menu, the footer and the collection shells; five copies that
 * had already drifted apart. Changing the set now means editing this array.
 *
 * `image` is a path under /public/categories. Omit it when there's no artwork yet — the card
 * grid falls back to a branded panel rather than a broken image.
 */
export type CategoryDef = {
  /** URL segment: /shop/<handle>. Also the key used by the product → category map. */
  handle: string;
  /** Key in the `categories` i18n namespace. */
  labelKey: string;
  image?: string;
};

export const CATEGORIES: CategoryDef[] = [
  { handle: "hair-extensions", labelKey: "hairExtensions", image: "/categories/extensions.png" },
  { handle: "hair-care", labelKey: "hairCare", image: "/categories/hair-care.png" },
  { handle: "hair-accessories", labelKey: "hairAccessories", image: "/categories/accessories.png" },
  { handle: "bonnets", labelKey: "bonnets", image: "/categories/bonnets.png" },
  { handle: "durags", labelKey: "durags", image: "/categories/durags.png" },
];

/** Collections whose contents come from the API rather than the manual map. */
export const DERIVED_COLLECTION_HANDLES = ["all-products"] as const;

export const CATEGORY_HANDLES = CATEGORIES.map((c) => c.handle);
