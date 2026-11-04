import { CATEGORY_HANDLES } from "../categories";

/**
 * Manual product → category mapping, keyed by EchoDesk product slug.
 *
 * EchoDesk has no categories endpoint and the tenant's `item-lists` are empty, so membership
 * is declared here. Its `attribute_values` are the eventual home for this — they're already
 * filterable — but the two attributes defined today have mismatched names, keys and types, so
 * nothing reliable can be derived from them yet.
 *
 * A product no longer needs an entry here to be categorised: `resolveCategories` reads its name
 * and slug and files it by keyword (see `CATEGORY_RULES`), so a new synthetic hair lands under
 * hair extensions the moment it goes live. An entry here is an *override* — it always wins — and
 * is only needed where the name would mislead. Valid handles are the ones in `lib/categories.ts`.
 * A product that matches neither still appears under All products (and Best sellers when
 * EchoDesk marks it featured) — it just won't show under a theme.
 */
export const PRODUCT_CATEGORIES: Record<string, string[]> = {
  // Braiding hair. EchoDesk derives the slug from the SKU, so these read as product codes
  // rather than names — see the note below about renaming them.
  "b-hs3089p-22": ["hair-extensions"], // არიელი 22″
  "b-hs3226p-24": ["hair-extensions"], // ანა 24″
  "4_kinky_curly_55_88": ["hair-extensions"], // 4 ცალი ხვეული თმა — Kinky Curly, 55.88 სმ
  "76_2_deep_wave_ocean_wave": ["hair-extensions"], // 76.2 სმ ხვეული თმა — Deep Wave & Ocean Wave
  "61": ["hair-extensions"], // წინასწარ გაწელილი თმა — 61 სმ, სტაფილოსფერი
  "6x_pre_stretched_braiding_hair_52_inch_kanekalon_yaki_texture": ["hair-extensions"], // 6X წინასწარ გაწელილი, 132 სმ
  "long_braided_ponytail_hair_extension_black": ["hair-extensions"], // გრძელი ნაწნავი კუდი — შავი
  "fashion_idol_ombre_blonde": ["hair-extensions"], // ტალღოვანი — Ombre Blonde
  "soft_body_wave_hair_extensions_blonde": ["hair-extensions"], // ტალღოვანი — Blonde
  "deep_wave_braiding_hair_extensions": ["hair-extensions"], // ღრმა ტალღოვანი, ნაწნავებისთვის
  "freedom_braid_collection_french_curl_synthetic_hair_56_cm": ["hair-extensions"], // Freedom Braid — French Curl, 56 სმ
  // The remaining four styles, added here so they land in the category the moment they go
  // live rather than sitting under All products until someone notices.
  "b-hs1047p-28": ["hair-extensions"], // არიელი სწორი 28″
  "b-h-ha4397p-24": ["hair-extensions"], // მანასი 24″
  "b-h-ha4422-24": ["hair-extensions"], // მონიკა 24″
  "b-h-ha4204p-20": ["hair-extensions"], // კრო-ალისია 20″
  // Finished pieces braided from the same hair, clipped into the wearer's own. They sit in
  // hair-extensions and are told apart from the hair by PRODUCT_SUBCATEGORIES below.
  "decorative_hair_accessory": ["hair-extensions"], // დეკორატიული — ტალღოვანი თმის სამაგრი
  "braided__metal_ring_clasps_2_piece_set": ["hair-extensions"], // მეტალის რგოლის სამაგრით — 2 ცალი
  "star_decorated_2_piece_set": ["hair-extensions"], // ვარსკვლავის დეკორით — 2 ცალი
  "hair_accessory_metal_decorations": ["hair-extensions"], // მეტალის დეკორით
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

/**
 * Which half of a split category a product sits in — see `subcategories` in lib/categories.ts.
 *
 * Overrides only. A product not listed is inferred from its name by `resolveSubcategory`
 * (clip-in words → "clip-in", curl words → "curls"), and otherwise falls to the category's `defaultKey`, so a new
 * braiding hair needs no entry here and never vanishes from every chip.
 */
export const PRODUCT_SUBCATEGORIES: Record<string, string> = {
  // Sold as an extension, worn as an accessory: it arrives already braided with an elastic
  // loop at the end, so it clips onto the wearer's own ponytail rather than being braided in.
  "long_braided_ponytail_hair_extension_black": "clip-in",
  "decorative_hair_accessory": "clip-in",
  "braided__metal_ring_clasps_2_piece_set": "clip-in",
  "star_decorated_2_piece_set": "clip-in",
  "hair_accessory_metal_decorations": "clip-in",
  // Curly to look at, but sold and used as braiding hair — the name's "curly" would otherwise
  // send it to afro curls.
  "76_2_deep_wave_ocean_wave": "braids",
  "freedom_braid_collection_french_curl_synthetic_hair_56_cm": "braids",
  "4_kinky_curly_55_88": "braids",
};

/**
 * Keyword rules for products the manual map doesn't list. First matching rule wins, so the
 * specific categories go before hair extensions, whose words ("hair", "braid") also appear in
 * a bonnet's or a wax's name. Latin terms are matched as whole words (so "gel" doesn't fire on
 * "angel"); Georgian terms are stems, since the language inflects ("ნაწნავებისთვის").
 */
const CATEGORY_RULES: { handle: string; latin: string[]; georgian: string[] }[] = [
  { handle: "durags", latin: ["durag", "durags", "doo rag"], georgian: ["დურაგ"] },
  { handle: "bonnets", latin: ["bonnet", "bonnets"], georgian: ["ბონეტ", "ბონნეტ", "ქუდ"] },
  {
    handle: "hair-care",
    latin: ["wax", "gel", "conditioner", "shampoo", "serum", "mousse", "leave-in", "pomade"],
    georgian: ["ცვილ", "კონდიციონერ", "შამპუნ", "სერუმ", "მოვლ", "გელ"],
  },
  {
    handle: "hair-extensions",
    latin: ["hair", "braid", "braiding", "braided", "extension", "extensions", "ponytail", "synthetic", "kanekalon"],
    georgian: ["თმა", "თმის", "ნაწნავ", "სინთეტიკ", "ხელოვნური თმ", "დაგრძელებ"],
  },
];

/** The category a product's own words point to, or none when they point nowhere. */
export function inferCategories(text: string): string[] {
  const t = text.toLowerCase();
  const rule = CATEGORY_RULES.find(
    (r) =>
      r.georgian.some((w) => t.includes(w)) ||
      r.latin.some((w) => new RegExp(`(^|[^a-z])${w}([^a-z]|$)`).test(t)),
  );
  return rule ? [rule.handle] : [];
}

/**
 * A product's categories: the manual override when it has one, otherwise inferred from its
 * names and slug. `names` is every language the product is named in.
 */
export function resolveCategories(slug: string, names: string[]): string[] {
  const manual = PRODUCT_CATEGORIES[slug];
  if (manual) return manual;
  return inferCategories([...names, slug.replace(/[_-]/g, " ")].join(" "));
}

/** The manual override alone — used where only a slug is at hand. Prefer `product.categories`. */
export function categoriesFor(slug: string): string[] {
  return PRODUCT_CATEGORIES[slug] ?? [];
}

const hasWord = (t: string, latin: string[], georgian: string[]) =>
  georgian.some((w) => t.includes(w)) ||
  latin.some((w) => new RegExp(`(^|[^a-z])${w}([^a-z]|$)`).test(t));

/**
 * Words that mark a finished clip-in piece rather than loose hair. Checked first: a clip-in
 * is often named for its look ("Wavy Hair Extension"), which would otherwise read as curls.
 */
const CLIP_IN_WORDS = {
  latin: ["accessory", "accessories", "clasp", "clasps", "clip", "clips"],
  georgian: ["აქსესუარ", "სამაგრ"],
};

/** Curl words, checked after clip-in so "Curly Braiding Hair" still counts as curls. */
const CURL_WORDS = {
  latin: ["curl", "curly", "kinky", "wave", "wavy", "waves"],
  georgian: ["ხვეულ", "ტალღ"],
};

export function inferSubcategory(text: string): string | null {
  const t = text.toLowerCase();
  if (hasWord(t, CLIP_IN_WORDS.latin, CLIP_IN_WORDS.georgian)) return "clip-in";
  if (hasWord(t, CURL_WORDS.latin, CURL_WORDS.georgian)) return "curls";
  return null;
}

/** A product's group inside its category: manual override, else inferred, else the default. */
export function resolveSubcategory(slug: string, names: string[], defaultKey: string): string {
  return PRODUCT_SUBCATEGORIES[slug] ?? inferSubcategory(names.join(" ")) ?? defaultKey;
}

export function subcategoryFor(slug: string, defaultKey: string): string {
  return PRODUCT_SUBCATEGORIES[slug] ?? defaultKey;
}

/** Guards against a typo silently hiding a product from its category. */
export function invalidCategoryHandles(): string[] {
  const valid = new Set(CATEGORY_HANDLES);
  return [...new Set(Object.values(PRODUCT_CATEGORIES).flat())].filter((h) => !valid.has(h));
}
