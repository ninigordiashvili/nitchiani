import { CATEGORY_HANDLES } from "../categories";

/**
 * Manual product → category mapping, keyed by EchoDesk product slug.
 *
 * EchoDesk has no categories endpoint and the tenant's `item-lists` are empty, so membership
 * is declared here. Its `attribute_values` are the eventual home for this — they're already
 * filterable — but the two attributes defined today have mismatched names, keys and types, so
 * nothing reliable can be derived from them yet.
 *
 * To place a product, add its slug with the handles it belongs to. Valid handles are the ones
 * in `lib/categories.ts`; an unlisted product still appears under All products (and Best
 * sellers when EchoDesk marks it featured) — it just won't show under a theme, which is the
 * honest default. A silent wrong guess is worse than a visible absence.
 */
export const PRODUCT_CATEGORIES: Record<string, string[]> = {
  // Braiding hair. EchoDesk derives the slug from the SKU, so these read as product codes
  // rather than names — see the note below about renaming them.
  "b-hs3089p-22": ["hair-extensions"], // არიელი 22″
  "b-hs3226p-24": ["hair-extensions"], // ანა 24″
  // The remaining four styles, added here so they land in the category the moment they go
  // live rather than sitting under All products until someone notices.
  "b-hs1047p-28": ["hair-extensions"], // არიელი სწორი 28″
  "b-h-ha4397p-24": ["hair-extensions"], // მანასი 24″
  "b-h-ha4422-24": ["hair-extensions"], // მონიკა 24″
  "b-h-ha4204p-20": ["hair-extensions"], // კრო-ალისია 20″
  // Lorenti care products.
  "lor-wax-08": ["hair-care"], // Gel Wax 08
  "lor-2ph": ["hair-care"], // 2 Phase conditioner
  "lor-2ph-03": ["hair-care"], // 2 Phase · keratin
  // Bonnets.
  "long_satin_bonnet_for_hair_black_gold": ["bonnets"], // გრძელი ატლასის ქუდი — შავი & ოქროსფერი
  "4_piece_satin_hair_bonnets_for_women_hair_protection_caps_with_tie_assorted_colors": ["bonnets"], // 4 ცალი ატლასის ბონეტი
  "long_satin_bonnet_for_hair_gold": ["bonnets"], // გრძელი ატლასის ქუდი — ოქროსფერი
  "satin_bonnet_for_hair_brown": ["bonnets"], // ატლასის ქუდი — ყავისფერი
  // Durags.
  "satin_durag_wave_cap_with_long_tail_wide_backstraps": ["durags"], // ატლასის დურაგი
  "satin_durag_wave_cap_with_long_tail_wide_backstraps_red": ["durags"], // ატლასის დურაგი — წითელი
  "satin_durag_wave_cap_with_long_tail_wide_backstraps_6_piece_set": ["durags"], // ატლასის დურაგი — 6 ცალი
};

export function categoriesFor(slug: string): string[] {
  return PRODUCT_CATEGORIES[slug] ?? [];
}

/** Guards against a typo silently hiding a product from its category. */
export function invalidCategoryHandles(): string[] {
  const valid = new Set(CATEGORY_HANDLES);
  return [...new Set(Object.values(PRODUCT_CATEGORIES).flat())].filter((h) => !valid.has(h));
}
