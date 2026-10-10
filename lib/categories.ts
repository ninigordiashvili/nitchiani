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
  /**
   * Words a shopper might type for this category, in either language.
   *
   * Georgian shoppers type product words in Latin constantly ("durag", "bonnet"), and the
   * merchant's own names don't always contain the category word — three of the four bonnets
   * are called "ქუდი", so searching the brand's own label found one of them. Matching is
   * substring, so a stem is enough: "ნაწნავ" covers ნაწნავი/ნაწნავები/ნაწნავებისთვის.
   */
  aliases: string[];
};

export const CATEGORIES: CategoryDef[] = [
  {
    handle: "hair-extensions",
    labelKey: "hairExtensions",
    image: "/categories/hair-extensions-cover.jpg",
    aliases: ["თმა", "თმის", "დაგრძელებ", "ნაწნავ", "ხვეულ", "ტალღოვან", "hair", "extension", "braid", "braiding", "curl", "wave", "ponytail"],
  },
  {
    handle: "hair-care",
    labelKey: "hairCare",
    image: "/categories/hair-care-cover.jpg",
    aliases: ["მოვლ", "ცვილ", "კონდიციონერ", "შამპუნ", "care", "wax", "gel", "conditioner", "shampoo"],
  },
  // Out of stock and hidden until it is restocked — commenting it out here removes it from
  // the chip row, the card grid, the mobile menu, the footer and the sitemap at once, since
  // all five read this array. The collection shell in lib/shopify/dummy.ts is commented out
  // alongside it so /shop/hair-accessories 404s rather than showing an empty category.
  // { handle: "hair-accessories", labelKey: "hairAccessories", image: "/categories/accessories.png" },
  {
    handle: "bonnets",
    labelKey: "bonnets",
    image: "/categories/bonnets-cover.jpg",
    aliases: ["ბონეტ", "ქუდ", "ატლას", "აბრეშუმ", "bonnet", "cap", "satin", "silk", "sleep"],
  },
  {
    handle: "durags",
    labelKey: "durags",
    image: "/categories/durags-cover.jpg",
    aliases: ["დურაგ", "ბანდან", "durag", "doo rag", "wave cap", "bandana"],
  },
];

/** Collections whose contents come from the API rather than the manual map. */
export const DERIVED_COLLECTION_HANDLES = ["all-products"] as const;

export const CATEGORY_HANDLES = CATEGORIES.map((c) => c.handle);
