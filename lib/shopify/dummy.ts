import type { Collection, Product } from "./types";
import type { Locale } from "../i18n/config";

// Default image used for any product that doesn't specify its own.
const DEFAULT_PRODUCT_IMAGE = "/products/gold-wax.png";

/** Hard ceiling on gallery length. Anything beyond this is dropped by `makeProduct`. */
export const MAX_PRODUCT_IMAGES = 5;

const img = (path: string | undefined, alt: string) => ({
  url: path ?? DEFAULT_PRODUCT_IMAGE,
  altText: alt,
  width: 900,
  height: 1125,
});

// Raw products carry both KA and EN text. Getters resolve to the active locale.
export type RawProductOption = {
  nameEn: string;
  nameKa: string;
  /**
   * Bilingual option values. The `en` field doubles as the canonical key referenced by
   * RawProductVariant.optionValues. For values that are international standards (15ml, 22",
   * 0.5mm), `en` and `ka` can be identical.
   */
  values: Array<{ en: string; ka: string }>;
};

export type RawProductVariant = {
  /** EN option values, index-aligned with rawOptions. Used as the canonical key. */
  optionValues: string[];
  /** Defaults to true. Set false to render strikethrough + disabled in the picker. */
  available?: boolean;
  /** Additive offset from base price (in GEL). Negative for discounts on smaller sizes. */
  priceDelta?: number;
};

export type RawProduct = Omit<
  Product,
  "title" | "description" | "productType" | "productTypeHandle" | "featuredImage" | "images" | "options" | "variants" | "priceRange" | "material" | "aftercare"
> & {
  titleKa: string;
  titleEn: string;
  descriptionKa: string;
  descriptionEn: string;
  /** Optional extended copy. If present, the PDP renders 3 accordion sections. */
  howToUseKa?: string;
  howToUseEn?: string;
  whatsInsideKa?: string;
  whatsInsideEn?: string;
  aftercareKa?: string;
  aftercareEn?: string;
  productTypeKa: string;
  productTypeEn: string;
  featuredImage: Product["featuredImage"];
  images: Product["images"];
  basePrice: number;
  baseCompareAt?: number;
  rawOptions: RawProductOption[];
  rawVariants: RawProductVariant[];
};

type RawCollection = Omit<Collection, "title" | "description" | "seoTitle" | "seoDescription" | "products"> & {
  titleKa: string;
  titleEn: string;
  descriptionKa: string;
  descriptionEn: string;
  /**
   * What search results show, when the page's own heading and intro don't fit: the heading is
   * a word or two, and the intro runs longer than the ~155 characters Google displays.
   */
  seoTitleKa?: string;
  seoTitleEn?: string;
  seoDescriptionKa?: string;
  seoDescriptionEn?: string;
  products: RawProduct[];
};

export function localizeProduct(p: RawProduct, locale: Locale): Product {
  const ka = locale === "ka";
  const currency = "GEL";

  const localizeValue = (opt: RawProductOption, enKey: string): string => {
    const match = opt.values.find((v) => v.en === enKey);
    if (!match) return enKey;
    return ka ? match.ka : match.en;
  };

  const options = p.rawOptions.map((opt) => ({
    name: ka ? opt.nameKa : opt.nameEn,
    values: opt.values.map((v) => (ka ? v.ka : v.en)),
  }));

  const variants = p.rawVariants.map((v, i) => {
    const variantPrice = p.basePrice + (v.priceDelta ?? 0);
    const localizedValues = v.optionValues.map((enKey, j) =>
      localizeValue(p.rawOptions[j], enKey),
    );
    return {
      id: `gid://nitchiani/Variant/${p.handle}-${i}`,
      title: localizedValues.length ? localizedValues.join(" / ") : "One Size",
      availableForSale: v.available !== false,
      selectedOptions: p.rawOptions.map((opt, j) => ({
        name: ka ? opt.nameKa : opt.nameEn,
        value: localizedValues[j],
      })),
      price: { amount: variantPrice.toFixed(2), currencyCode: currency },
      compareAtPrice: p.baseCompareAt
        ? { amount: (p.baseCompareAt + (v.priceDelta ?? 0)).toFixed(2), currencyCode: currency }
        : undefined,
    };
  });

  const prices = variants.map((v) => Number.parseFloat(v.price.amount));
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);

  return {
    id: p.id,
    handle: p.handle,
    title: ka ? p.titleKa : p.titleEn,
    description: ka ? p.descriptionKa : p.descriptionEn,
    howToUse: ka ? p.howToUseKa : p.howToUseEn,
    whatsInside: ka ? p.whatsInsideKa : p.whatsInsideEn,
    aftercare: ka ? p.aftercareKa : p.aftercareEn,
    productType: ka ? p.productTypeKa : p.productTypeEn,
    // Slug-form English type — used as the breadcrumb category link target. Stable
    // across locales so URLs stay consistent regardless of viewer language.
    productTypeHandle: p.productTypeEn.toLowerCase().replace(/\s+/g, "-"),
    tags: p.tags,
    vendor: p.vendor,
    featuredImage: p.featuredImage,
    images: p.images,
    options,
    variants,
    priceRange: {
      min: { amount: minPrice.toFixed(2), currencyCode: currency },
      max: { amount: maxPrice.toFixed(2), currencyCode: currency },
    },
    isBestSeller: p.isBestSeller,
  };
}

export function localizeCollection(c: RawCollection, locale: Locale): Collection {
  const ka = locale === "ka";
  return {
    id: c.id,
    handle: c.handle,
    title: ka ? c.titleKa : c.titleEn,
    description: ka ? c.descriptionKa : c.descriptionEn,
    seoTitle: ka ? c.seoTitleKa : c.seoTitleEn,
    seoDescription: ka ? c.seoDescriptionKa : c.seoDescriptionEn,
    image: c.image,
    products: c.products.map((p) => localizeProduct(p, locale)),
  };
}

function makeProduct(p: {
  handle: string;
  titleKa: string;
  titleEn: string;
  descriptionKa: string;
  descriptionEn: string;
  howToUseKa?: string;
  howToUseEn?: string;
  whatsInsideKa?: string;
  whatsInsideEn?: string;
  aftercareKa?: string;
  aftercareEn?: string;
  productTypeKa: string;
  productTypeEn: string;
  /** Base price (GEL). Each variant can override via priceDelta. */
  price: number;
  compareAt?: number;
  tags?: string[];
  /** Path under /public, e.g. "/products/silk-bonnet-noir.png". Falls back to gold-wax. */
  image?: string;
  /** Optional secondary image for the gallery. */
  imageAlt?: string;
  /**
   * Extra gallery shots, in display order after `image` and `imageAlt`. Paths under /public.
   * The gallery is capped at MAX_PRODUCT_IMAGES (5) — anything past that is dropped rather
   * than silently overflowing the thumbnail rail.
   */
  gallery?: string[];
  isBestSeller?: boolean;
  /** Option groups (e.g. Color, Size). Omit for a single-SKU product. */
  options?: RawProductOption[];
  /** Variant rows. Omit for a single-SKU product (defaults to one variant with no options). */
  variants?: RawProductVariant[];
}): RawProduct {
  return {
    id: `gid://nitchiani/Product/${p.handle}`,
    handle: p.handle,
    titleKa: p.titleKa,
    titleEn: p.titleEn,
    descriptionKa: p.descriptionKa,
    descriptionEn: p.descriptionEn,
    howToUseKa: p.howToUseKa,
    howToUseEn: p.howToUseEn,
    whatsInsideKa: p.whatsInsideKa,
    whatsInsideEn: p.whatsInsideEn,
    aftercareKa: p.aftercareKa,
    aftercareEn: p.aftercareEn,
    productTypeKa: p.productTypeKa,
    productTypeEn: p.productTypeEn,
    tags: p.tags ?? [],
    vendor: "Nitchiani",
    featuredImage: img(p.image, p.titleEn),
    // Alt text is numbered per position so repeated shots of one product stay distinguishable
    // to screen readers instead of announcing the same string several times over.
    images: [
      img(p.image, p.titleEn),
      ...(p.imageAlt ? [img(p.imageAlt, `${p.titleEn} alt`)] : []),
      ...(p.gallery ?? []).map((path, i) => img(path, `${p.titleEn} — view ${i + 2}`)),
    ].slice(0, MAX_PRODUCT_IMAGES),
    basePrice: p.price,
    baseCompareAt: p.compareAt,
    rawOptions: p.options ?? [],
    rawVariants: p.variants ?? [{ optionValues: [], available: true }],
    isBestSeller: p.isBestSeller,
  };
}

export const DUMMY_RAW_PRODUCTS: RawProduct[] = [
  makeProduct({
    handle: "silk-bonnet-noir",
    titleEn: "Silk Bonnet",
    titleKa: "აბრეშუმის ბონნეტი",
    descriptionEn:
      "100% mulberry silk bonnet with adjustable elastic. Reduces frizz and protects locs overnight without the slip-and-slide of cheap satin.",
    descriptionKa:
      "100% თუთის აბრეშუმის ბონნეტი რეგულირებადი რეზინით. ამცირებს ფაფუკობას და იცავს ლოკსებს ღამის განმავლობაში — იაფი სატენისგან განსხვავებით, თავიდან არ ცურდება.",
    howToUseEn:
      "Slip on after your nightly oil routine. Tuck longer locs in fully. The hidden inner band keeps it in place — no need to over-tighten the elastic.",
    howToUseKa:
      "ჩაიცვი ღამის ზეთის რუტინის შემდეგ. გრძელი ლოკსები სრულად ჩატანე შიგნით. ფარული შიდა ზოლი ფიქსაციისთვის საკმარისია — ელასტიკის გადაჭიმვა არ არის საჭირო.",
    whatsInsideEn:
      "100% mulberry silk shell · soft elastic band · hidden inner satin liner · adjustable bow detail. Hand-wash with cool water and a mild detergent. Air-dry flat.",
    whatsInsideKa:
      "100% თუთის აბრეშუმის ზედაპირი · რბილი ელასტიკი · ფარული სატენის სარჩული · რეგულირებადი ფანტი. ცივი წყლით ხელით ირეცხება მსუბუქი საშუალებით. გასაშრობად დადე ბრტყლად.",
    productTypeEn: "Bonnets",
    productTypeKa: "ბონნეტები",
    price: 89,
    image: "/products/silk-bonnet-noir.png",
    // Gallery demo: the same shot repeated so the thumbnail rail has something to show
    // until real alternate angles land. Capped at MAX_PRODUCT_IMAGES with `image` above.
    gallery: ["/products/silk-bonnet-noir.png", "/products/silk-bonnet-noir.png", "/products/silk-bonnet-noir.png", "/products/silk-bonnet-noir.png"],
    isBestSeller: true,
    tags: ["bonnets", "best-seller"],
    options: [
      {
        nameEn: "Color",
        nameKa: "ფერი",
        values: [
          { en: "Noir", ka: "შავი" },
          { en: "Cream", ka: "კრემისფერი" },
          { en: "Maroon", ka: "ბორდო" },
        ],
      },
    ],
    variants: [
      { optionValues: ["Noir"] },
      { optionValues: ["Cream"] },
      { optionValues: ["Maroon"], available: false },
    ],
  }),
  makeProduct({
    handle: "loc-care-oil-15ml",
    titleEn: "Loc Care Oil",
    titleKa: "ლოკსების მოვლის ზეთი",
    descriptionEn: "Lightweight scalp + loc oil with cold-pressed castor, golden jojoba, and tea tree. Absorbs in seconds — no greasy residue, no buildup.",
    descriptionKa: "მსუბუქი ზეთი თავის კანისა და ლოკსებისთვის — ცივი დაწურვის კასტორი, ოქროსფერი ჯოჯობა და ჩაის ხის ექსტრაქტი. წამებში შეიწოვება — ცხიმი არ რჩება, დაგროვება არ ხდება.",
    howToUseEn:
      "Apply 3–5 drops directly to the scalp 2–3 times a week. Massage gently. For locs, smooth one drop along the length to seal moisture. Safe for daily use on dry ends.",
    howToUseKa:
      "3–5 წვეთი დაიდე პირდაპირ თავის კანზე კვირაში 2–3 ჯერ. დაიმასაჟე ნაზად. ლოკსებისთვის გადაუსვი ერთი წვეთი სიგრძეზე ტენიანობის შესანახად. ყოველდღიური გამოყენებისთვის უსაფრთხოა მშრალი ბოლოებისთვის.",
    whatsInsideEn:
      "Cold-pressed castor oil · jojoba · tea tree essential oil · vitamin E. No mineral oil, no silicones, no fragrance. Cruelty-free.",
    whatsInsideKa:
      "ცივი დაწურვის კასტორი · ჯოჯობა · ჩაის ხის ეთერზეთი · ვიტამინი E. მინერალური ზეთის, სილიკონის ან არომატიზატორის გარეშე. Cruelty-free.",
    productTypeEn: "Loc Care",
    productTypeKa: "ლოკსების მოვლა",
    price: 64,
    compareAt: 79,
    image: "/products/loc-care-oil-15ml.png",
    // Gallery demo: the same shot repeated so the thumbnail rail has something to show
    // until real alternate angles land. Capped at MAX_PRODUCT_IMAGES with `image` above.
    gallery: ["/products/loc-care-oil-15ml.png", "/products/loc-care-oil-15ml.png", "/products/loc-care-oil-15ml.png", "/products/loc-care-oil-15ml.png"],
    isBestSeller: true,
    tags: ["loc-care", "best-seller"],
    options: [
      {
        nameEn: "Size",
        nameKa: "ზომა",
        values: [
          { en: "15ml", ka: "15მლ" },
          { en: "30ml", ka: "30მლ" },
        ],
      },
    ],
    variants: [
      { optionValues: ["15ml"] },
      { optionValues: ["30ml"], priceDelta: 28 },
    ],
  }),
  makeProduct({
    handle: "wood-loc-pick",
    titleEn: "Wood Loc Pick",
    titleKa: "ხის ლოკ-პიკი",
    descriptionEn: "Hand-cut beechwood pick with a polished, snag-free finish. Designed to interlock loc roots without tearing — the wood grain glides where metal pulls.",
    descriptionKa: "ხელით ნაჭრი წიფლის ხის პიკი გაპრიალებული, გლუვი ზედაპირით. შექმნილია ლოკსების ფესვების გადასაწვნად ისე, რომ თმა არ დაიშალოს — ხის ფაქტურა სრიალებს იქ, სადაც ლითონი იჭერს.",
    howToUseEn:
      "Insert at the root, twist gently in one direction, lift to lock. Use the 0.5mm tip for new growth, the 0.75mm for mature locs.",
    howToUseKa:
      "ჩაყავი ფესვთან, ნაზად დაატრიალე ერთი მიმართულებით, ასწიე ფიქსაციისთვის. 0.5მმ ბოლო — ახალი ზრდისთვის; 0.75მმ — მომწიფებული ლოკსებისთვის.",
    whatsInsideEn:
      "FSC-certified beechwood handle · polished steel needle · linseed-oil finish. Wipe clean with a dry cloth. Re-oil annually to maintain.",
    whatsInsideKa:
      "FSC-სერტიფიცირებული წიფლის ხის სახელური · გაპრიალებული ფოლადის ნემსი · სელის ზეთის დაფარვა. გაასუფთავე მშრალი ნაჭრით. წელიწადში ერთხელ ხელახლა შეზეთე.",
    productTypeEn: "Tools",
    productTypeKa: "ხელსაწყოები",
    price: 38,
    image: "/products/wood-loc-pick.png",
    isBestSeller: true,
    tags: ["tools", "best-seller"],
    options: [
      {
        nameEn: "Tip Width",
        nameKa: "ზომა",
        values: [
          { en: "0.5mm", ka: "0.5მმ" },
          { en: "0.75mm", ka: "0.75მმ" },
        ],
      },
    ],
    variants: [
      { optionValues: ["0.5mm"] },
      { optionValues: ["0.75mm"] },
    ],
  }),
  makeProduct({
    handle: "satin-pillowcase-cream",
    titleEn: "Satin Pillowcase",
    titleKa: "სატენის ბალიშის გარსი",
    descriptionEn: "King-size satin pillowcase with a hidden zip closure. Lets your locs slide instead of tug — the difference is visible by week one. Equally good for skin (no creases, no friction).",
    descriptionKa: "King-size ზომის სატენის ბალიშის გარსი დაფარული ზიპით. ლოკსები სრიალებს ნაცვლად აჭიმვისა — სხვაობა ერთ კვირაში ჩანს. კანისთვისაც კარგია (ნაოჭები არა, ხახუნი არა).",
    howToUseEn:
      "Use over your existing pillow. Wash separately on cold, gentle cycle. Skip the dryer — air dry to keep the satin sheen.",
    howToUseKa:
      "გამოიყენე არსებული ბალიშის ზემოდან. დარეცხე ცალკე, ცივი წყლით, ნაზ რეჟიმში. საშრობში არ ჩადო — გაიშრე ჰაერზე, რომ სატენის ბრჭყვიალი შეინარჩუნო.",
    whatsInsideEn:
      "100% premium satin · 50×75 cm (king) · hidden YKK zip · 200-thread weave. Available in cream and noir.",
    whatsInsideKa:
      "100% პრემიუმ სატენი · 50×75 სმ (king) · დაფარული YKK ზიპი · 200-ძაფიანი ქსოვა. ხელმისაწვდომია კრემისფერი და შავი ვერსიები.",
    productTypeEn: "Accessories",
    productTypeKa: "აქსესუარები",
    price: 110,
    image: "/products/satin-pillowcase-cream.png",
    isBestSeller: true,
    tags: ["accessories", "best-seller"],
    options: [
      {
        nameEn: "Color",
        nameKa: "ფერი",
        values: [
          { en: "Cream", ka: "კრემისფერი" },
          { en: "Noir", ka: "შავი" },
        ],
      },
    ],
    variants: [
      { optionValues: ["Cream"] },
      { optionValues: ["Noir"] },
    ],
  }),
  makeProduct({
    handle: "human-hair-extension-22-noir",
    titleEn: "Human Hair Extension",
    titleKa: "ბუნებრივი თმის ექსტენშენი",
    descriptionEn:
      "Premium human hair extension. Pre-stretched, ready to install. Ethically sourced.",
    descriptionKa:
      "პრემიუმ ხარისხის ბუნებრივი თმის ექსტენშენი. წინასწარ დაჭიმული, მზადყოფნის მდგომარეობაში. ეთიკური წარმოშობისა.",
    productTypeEn: "Extensions",
    productTypeKa: "ექსტენშენები",
    price: 320,
    image: "/products/human-hair-extension-22-noir.png",
    tags: ["extensions", "new"],
    options: [
      {
        nameEn: "Length",
        nameKa: "სიგრძე",
        values: [
          { en: "18\"", ka: "18\"" },
          { en: "22\"", ka: "22\"" },
          { en: "26\"", ka: "26\"" },
        ],
      },
    ],
    variants: [
      { optionValues: ["18\""], priceDelta: -60 },
      { optionValues: ["22\""] },
      { optionValues: ["26\""], priceDelta: 80 },
    ],
  }),
  makeProduct({
    handle: "loc-detox-rinse",
    titleEn: "Loc Detox Rinse",
    titleKa: "ლოკსების დეტოქსის ჩამოსარეცხი",
    descriptionEn: "Apple cider vinegar + bentonite clay rinse. 250ml.",
    descriptionKa: "ვაშლის ძმარი + ბენტონიტის თიხის ჩამოსარეცხი. 250მლ.",
    productTypeEn: "Loc Care",
    productTypeKa: "ლოკსების მოვლა",
    price: 72,
    image: "/products/loc-detox-rinse.png",
    tags: ["loc-care", "new"],
  }),
  makeProduct({
    handle: "edge-control-mini",
    titleEn: "Edge Control Mini",
    titleKa: "კიდეების ფიქსატორი — მინი",
    descriptionEn: "Lightweight edge gel — long-hold, no flake. 30ml.",
    descriptionKa: "მსუბუქი ფიქსაციის გელი კიდეებისთვის — გრძელი დაკავება, ფიფქების გარეშე. 30მლ.",
    productTypeEn: "Loc Care",
    productTypeKa: "ლოკსების მოვლა",
    price: 42,
    image: "/products/edge-control-mini.png",
    tags: ["loc-care", "new"],
  }),
  makeProduct({
    handle: "gold-loc-cuff-set",
    titleEn: "Gold Loc Cuff Set",
    titleKa: "ოქროსფერი ლოკ-მანჟეტების ნაკრები",
    descriptionEn: "Hammered brass loc cuffs. Adjustable.",
    descriptionKa: "ჩაქუჩისებური თითბრის ლოკ-მანჟეტები. რეგულირებადი ზომით.",
    productTypeEn: "Accessories",
    productTypeKa: "აქსესუარები",
    price: 56,
    image: "/products/gold-loc-cuff-set.png",
    tags: ["accessories", "new"],
    options: [
      {
        nameEn: "Pack Size",
        nameKa: "რაოდენობა",
        values: [
          { en: "8 ct", ka: "8 ცალი" },
          { en: "16 ct", ka: "16 ცალი" },
        ],
      },
    ],
    variants: [
      { optionValues: ["8 ct"] },
      { optionValues: ["16 ct"], priceDelta: 40 },
    ],
  }),

  // ─────────────────────────────────────────────────────────────────────────────
  // Catalog padding — additional SKUs to make the homepage grids feel like a
  // real store. No product photography yet → fall back to /products/gold-wax.png.
  // ─────────────────────────────────────────────────────────────────────────────

  // Bonnets ────────────────────────────────────────────────────────
  makeProduct({
    handle: "satin-sleep-cap",
    titleEn: "Satin Sleep Cap",
    titleKa: "სატენის ღამის ქუდი",
    descriptionEn: "Lightweight satin sleep cap with a wide elastic band. Slimmer profile than the silk bonnet — sits closer to the head.",
    descriptionKa: "მსუბუქი სატენის ღამის ქუდი ფართო ელასტიკით. შედარებით ვიწრო ფორმა აბრეშუმის ბონნეტთან შედარებით — უფრო მჭიდროდ ჯდება თავზე.",
    productTypeEn: "Bonnets",
    productTypeKa: "ბონნეტები",
    price: 52,
    image: "/products/silk-bonnet-noir.png",
    tags: ["bonnets", "new"],
    options: [
      {
        nameEn: "Color",
        nameKa: "ფერი",
        values: [
          { en: "Noir", ka: "შავი" },
          { en: "Cream", ka: "კრემისფერი" },
        ],
      },
    ],
    variants: [{ optionValues: ["Noir"] }, { optionValues: ["Cream"] }],
  }),
  makeProduct({
    handle: "silk-hair-wrap",
    titleEn: "Silk Hair Wrap",
    titleKa: "აბრეშუმის თმის შარფი",
    descriptionEn: "Long rectangular mulberry silk wrap. Tie it your way — turban, headscarf, or overnight protector for elaborate styles.",
    descriptionKa: "გრძელი მართკუთხა თუთის აბრეშუმის შარფი. შეკარი როგორც გინდა — თურბანი, თავსაბურავი ან ღამის დაცვა რთული ვარცხნილობისთვის.",
    productTypeEn: "Bonnets",
    productTypeKa: "ბონნეტები",
    price: 98,
    image: "/products/satin-pillowcase-cream.png",
    tags: ["bonnets", "new"],
  }),
  makeProduct({
    handle: "kids-silk-bonnet",
    titleEn: "Kids Silk Bonnet",
    titleKa: "საბავშვო აბრეშუმის ბონნეტი",
    descriptionEn: "Smaller silk bonnet sized for ages 3–10. Same mulberry silk and adjustable band — gentler elastic for sensitive scalps.",
    descriptionKa: "პატარა ზომის აბრეშუმის ბონნეტი 3–10 წლისთვის. იგივე თუთის აბრეშუმი და რეგულირებადი ზოლი — უფრო რბილი ელასტიკი მგრძნობიარე თავის კანისთვის.",
    productTypeEn: "Bonnets",
    productTypeKa: "ბონნეტები",
    price: 68,
    image: "/products/silk-bonnet-noir.png",
    tags: ["bonnets"],
    options: [
      {
        nameEn: "Color",
        nameKa: "ფერი",
        values: [
          { en: "Noir", ka: "შავი" },
          { en: "Cream", ka: "კრემისფერი" },
          { en: "Rose", ka: "ვარდისფერი" },
        ],
      },
    ],
    variants: [
      { optionValues: ["Noir"] },
      { optionValues: ["Cream"] },
      { optionValues: ["Rose"] },
    ],
  }),

  // Tools ──────────────────────────────────────────────────────────
  makeProduct({
    handle: "steel-loc-pick",
    titleEn: "Steel Loc Pick",
    titleKa: "ფოლადის ლოკ-პიკი",
    descriptionEn: "Surgical-grade stainless steel pick with a knurled grip. Faster than wood for fresh interlocks; sterilizable.",
    descriptionKa: "ქირურგიული უჟანგავი ფოლადის პიკი დაკბილული სახელურით. ხეზე უფრო სწრაფი ახალი ფესვების ფიქსაციისთვის; სტერილიზებადი.",
    productTypeEn: "Tools",
    productTypeKa: "ხელსაწყოები",
    price: 48,
    image: "/products/wood-loc-pick.png",
    tags: ["tools", "new"],
    options: [
      {
        nameEn: "Tip Width",
        nameKa: "ზომა",
        values: [
          { en: "0.5mm", ka: "0.5მმ" },
          { en: "0.75mm", ka: "0.75მმ" },
        ],
      },
    ],
    variants: [{ optionValues: ["0.5mm"] }, { optionValues: ["0.75mm"] }],
  }),
  makeProduct({
    handle: "aluminum-loc-tool",
    titleEn: "Aluminum Loc Tool",
    titleKa: "ალუმინის ლოკ-ხელსაწყო",
    descriptionEn: "Ultra-light anodized aluminum interlocking tool. Three loops on one body — small, medium, large.",
    descriptionKa: "ულტრა-მსუბუქი ანოდიზებული ალუმინის ხელსაწყო. ერთ სახელურზე სამი მარყუჟი — პატარა, საშუალო, დიდი.",
    productTypeEn: "Tools",
    productTypeKa: "ხელსაწყოები",
    price: 44,
    image: "/products/wood-loc-pick.png",
    isBestSeller: true,
    tags: ["tools", "best-seller"],
  }),
  makeProduct({
    handle: "loc-microfiber-towel",
    titleEn: "Loc Microfiber Towel",
    titleKa: "ლოკსების მიკროფიბრის პირსახოცი",
    descriptionEn: "Quick-dry microfiber towel sized for locs. Reduces drying time by half versus cotton — no frizz, no lint.",
    descriptionKa: "სწრაფი შრობის მიკროფიბრის პირსახოცი ლოკსებისთვის. ბამბასთან შედარებით ნახევრად ამცირებს შრობის დროს — ფაფუკობის და ბუხის გარეშე.",
    productTypeEn: "Tools",
    productTypeKa: "ხელსაწყოები",
    price: 36,
    image: "/products/satin-pillowcase-cream.png",
    tags: ["tools"],
  }),

  // Extensions ─────────────────────────────────────────────────────
  makeProduct({
    handle: "synthetic-braid-hair",
    titleEn: "Synthetic Braid Hair",
    titleKa: "სინთეტიკური ფრჩხის თმა",
    descriptionEn: "Premium kanekalon braiding hair. Heat-resistant, low-itch formula. Approachable price for everyday styles.",
    descriptionKa: "პრემიუმ კანეკალონის ფრჩხის თმა. სითბოს მდგრადი, ნაკლებად მაღიზიანებელი ფორმულა. ხელმისაწვდომი ფასი ყოველდღიური სტილებისთვის.",
    productTypeEn: "Extensions",
    productTypeKa: "ექსტენშენები",
    price: 85,
    image: "/products/human-hair-extension-22-noir.png",
    isBestSeller: true,
    tags: ["extensions", "best-seller"],
    options: [
      {
        nameEn: "Color",
        nameKa: "ფერი",
        values: [
          { en: "Noir", ka: "შავი" },
          { en: "Brown", ka: "ყავისფერი" },
          { en: "Burgundy", ka: "ბორდო" },
        ],
      },
    ],
    variants: [
      { optionValues: ["Noir"] },
      { optionValues: ["Brown"] },
      { optionValues: ["Burgundy"] },
    ],
  }),
  makeProduct({
    handle: "curly-hair-bundle-18",
    titleEn: "Curly Hair Bundle 18\"",
    titleKa: "ხუჭუჭა თმის შეკვრა 18\"",
    descriptionEn: "Pre-curled human hair bundle, 18 inches. Bouncy, defined curl pattern — installs as a half-up, sew-in, or quick weave.",
    descriptionKa: "წინასწარ ხუჭუჭა ბუნებრივი თმის შეკვრა, 18 დიუმი. ელასტიური, განსაზღვრული ხუჭუჭის ფაქტურა — დაამონტაჟე ნახევრად ზევით, შეკერვით ან სწრაფი ვივის სახით.",
    productTypeEn: "Extensions",
    productTypeKa: "ექსტენშენები",
    price: 280,
    image: "/products/human-hair-extension-22-noir.png",
    tags: ["extensions", "new"],
  }),

  // Accessories ────────────────────────────────────────────────────
  makeProduct({
    handle: "wooden-loc-beads-5",
    titleEn: "Wooden Loc Beads (5 ct)",
    titleKa: "ხის ლოკ-მძივები (5 ცალი)",
    descriptionEn: "Hand-turned olive-wood beads with a 10mm channel. Natural alternative to metal cuffs — won't snag fine locs.",
    descriptionKa: "ხელით გამოშლილი ზეთისხილის ხის მძივები 10მმ არხით. ბუნებრივი ალტერნატივა ლითონის მანჟეტებისთვის — წვრილ ლოკსებს არ აზიანებს.",
    productTypeEn: "Accessories",
    productTypeKa: "აქსესუარები",
    price: 28,
    image: "/products/gold-loc-cuff-set.png",
    tags: ["accessories", "new"],
  }),
  makeProduct({
    handle: "silk-headband",
    titleEn: "Silk Headband",
    titleKa: "აბრეშუმის თავსაკრავი",
    descriptionEn: "Wide silk headband with non-slip lining. Perfect for studio days, workouts, or framing fresh braids.",
    descriptionKa: "ფართო აბრეშუმის თავსაკრავი არასრიალი სარჩულით. იდეალურია სტუდიური დღეებისთვის, ვარჯიშისთვის ან ახალი ფრჩხების ჩარჩოსთვის.",
    productTypeEn: "Accessories",
    productTypeKa: "აქსესუარები",
    price: 65,
    image: "/products/silk-bonnet-noir.png",
    isBestSeller: true,
    tags: ["accessories", "best-seller"],
    options: [
      {
        nameEn: "Color",
        nameKa: "ფერი",
        values: [
          { en: "Noir", ka: "შავი" },
          { en: "Cream", ka: "კრემისფერი" },
          { en: "Maroon", ka: "ბორდო" },
        ],
      },
    ],
    variants: [
      { optionValues: ["Noir"] },
      { optionValues: ["Cream"] },
      { optionValues: ["Maroon"] },
    ],
  }),
];

export const DUMMY_RAW_COLLECTIONS: RawCollection[] = [
  {
    id: "gid://nitchiani/Collection/hair-extensions",
    handle: "hair-extensions",
    titleEn: "Hair Extensions",
    titleKa: "ხელოვნური თმა",
    descriptionEn:
      "Synthetic hair for braids and protective styles — every texture you need in one place.\n\nLengths from 54 to 132 cm, in shades from natural black to blonde and ombré. Buy a single pack or a 4- or 6-pack set.\n\nPre-stretched hair makes braiding quicker. Each product page says whether it's heat-resistant.\n\nDelivery in 1–3 working days in Tbilisi, 3–7 elsewhere in Georgia. Pickup in Tbilisi is free.",
    descriptionKa:
      "ხელოვნური თმა ნაწნავებისა და ვარცხნილობისთვის — ყველა საჭირო ტექსტურა ერთ ადგილას.\n\nსიგრძე — 54-დან 132 სმ-მდე. ფერები — ნატურალური შავიდან ქერასა და ომბრემდე. იყიდება ცალკე შეკვრად ან 4- და 6-ცალიან ნაკრებად.\n\nწინასწარ გაწელილი თმით ნაწნავი უფრო სწრაფად იწვნება. სითბოს მიმართ მდგრადობა თითოეული პროდუქტის გვერდზეა მითითებული.\n\nმიწოდება თბილისში 1–3 სამუშაო დღეში, რეგიონებში — 3–7 დღეში. თბილისში გატანა უფასოა.",
    seoTitleKa: "ხელოვნური თმა ნაწნავებისა და ხვეულებისთვის",
    seoTitleEn: "Synthetic Braiding Hair Extensions in Georgia",
    seoDescriptionKa:
      "სინთეტიკური თმა ნაწნავებისთვის: deep wave, body wave, kinky curly და Yaki, 54–132 სმ. მიწოდება მთელ საქართველოში ან უფასო გატანა თბილისში.",
    seoDescriptionEn:
      "Synthetic braiding hair in deep wave, body wave, kinky curly and Yaki textures, 54–132 cm. Delivery across Georgia or free pickup in Tbilisi.",
    // Membership comes from lib/echodesk/categories.ts when the catalog is live.
    products: [],
  },
  {
    id: "gid://nitchiani/Collection/hair-care",
    handle: "hair-care",
    titleEn: "Hair Care",
    titleKa: "თმის მოვლა",
    descriptionEn:
      "Professional Lorenti care for every day.\n\nTwo-phase leave-in conditioner (400 ml, with biotin or keratin) — no rinsing needed, with built-in heat protection. Hair detangles easily.\n\nGel Wax 08 (150 ml) — strong all-day hold with no greasy residue.\n\nBoth suit natural and synthetic hair alike.\n\nDelivery in 1–3 working days in Tbilisi, 3–7 elsewhere in Georgia. Pickup in Tbilisi is free.",
    descriptionKa:
      "Lorenti-ს პროფესიონალური საშუალებები ყოველდღიური მოვლისთვის.\n\nორფაზიანი ლივ-ინ კონდიციონერი (400 მლ, ბიოტინით ან კერატინით) — არ საჭიროებს ჩამობანას და აქვს თერმო დამცავი ფუნქცია. თმა ადვილად ივარცხნება.\n\nGel Wax 08 (150 მლ) — ძლიერი ფიქსაცია მთელი დღის განმავლობაში, ცხიმიანი კვალის გარეშე.\n\nორივე შესაფერისია როგორც ბუნებრივი, ასევე ხელოვნური თმისთვის.\n\nმიწოდება თბილისში 1–3 სამუშაო დღეში, რეგიონებში — 3–7 დღეში. თბილისში გატანა უფასოა.",
    seoTitleKa: "თმის მოვლა — Lorenti კონდიციონერი და თმის ცვილი",
    seoTitleEn: "Hair Care — Lorenti Leave-In Conditioner & Wax",
    seoDescriptionKa: "Lorenti-ს ორფაზიანი ლივ-ინ კონდიციონერი და თმის ცვილი ყოველდღიური მოვლისთვის. მიწოდება მთელ საქართველოში ან უფასო გატანა თბილისში.",
    seoDescriptionEn: "Lorenti two-phase leave-in conditioner and ultra-hold hair wax for everyday care. Delivery across Georgia or free pickup in Tbilisi.",
    // Membership comes from lib/echodesk/categories.ts when the catalog is live.
    products: [],
  },
  // Hidden while out of stock — see the matching entry in lib/categories.ts. Kept rather than
  // deleted so restocking is one uncomment in each file; the copy here was never written from
  // real stock, so replace it when the accessories are actually known.
  // {
  //   id: "gid://nitchiani/Collection/hair-accessories",
  //   handle: "hair-accessories",
  //   titleEn: "Hair Accessories",
  //   titleKa: "თმის აქსესუარი",
  //   descriptionEn: "Beads, cuffs, rings and tools.",
  //   descriptionKa: "მძივები, რგოლები და აქსესუარები.",
  //   products: [],
  // },
  {
    id: "gid://nitchiani/Collection/bonnets",
    handle: "bonnets",
    titleEn: "Bonnets",
    titleKa: "ბონეტი",
    descriptionEn:
      "Satin bonnets to protect your hair — for sleep and everyday wear.\n\nThe smooth, satin-like fabric reduces friction against your pillow, so your hair keeps its shape and looks neat in the morning.\n\nSuitable for every hair type — curly, wavy or straight. The long styles have room for braids and extensions too.\n\nDelivery in 1–3 working days in Tbilisi, 3–7 elsewhere in Georgia. Pickup in Tbilisi is free.",
    descriptionKa:
      "ატლასის ბონეტები თმის დასაცავად — ძილისა და ყოველდღიური გამოყენებისთვის.\n\nგლუვი, სატინის მსგავსი ქსოვილი ამცირებს თმის ხახუნს ბალიშთან, ამიტომ დილით თმა ფორმასა და მოწესრიგებულ იერს ინარჩუნებს.\n\nშესაფერისია ნებისმიერი ტიპის თმისთვის — ხვეული, ტალღოვანი თუ სწორი. გრძელ მოდელებში ნაწნავები და დაგრძელებული თმაც თავისუფლად ეტევა.\n\nმიწოდება თბილისში 1–3 სამუშაო დღეში, რეგიონებში — 3–7 დღეში. თბილისში გატანა უფასოა.",
    seoTitleKa: "ატლასის ბონეტები — თმის დაცვა ძილის დროს",
    seoTitleEn: "Satin Hair Bonnets for Sleep & Hair Protection",
    seoDescriptionKa: "ატლასის ბონეტები, რომლებიც ამცირებს ხახუნს და ძილის დროს თმის ფორმას ინარჩუნებს. მიწოდება მთელ საქართველოში ან უფასო გატანა თბილისში.",
    seoDescriptionEn: "Satin bonnets that reduce friction and keep your hair's shape overnight. Delivery across Georgia or free pickup in Tbilisi.",
    // Membership comes from lib/echodesk/categories.ts when the catalog is live.
    products: [],
  },
  {
    id: "gid://nitchiani/Collection/durags",
    handle: "durags",
    titleEn: "Durags",
    titleKa: "დურაგი",
    descriptionEn:
      "Satin durags for everyday style and hair care.\n\nThe fitted shape hugs your head and keeps your hair neat, and the long ties let you adjust the fit exactly how you like it.\n\nAvailable in a range of colours — on their own or as a 6-piece set.\n\nDelivery in 1–3 working days in Tbilisi, 3–7 elsewhere in Georgia. Pickup in Tbilisi is free.",
    descriptionKa:
      "ატლასის დურაგები ყოველდღიური სტილისა და თმის მოვლისთვის.\n\nფორმა მჭიდროდ ერგება თავს და თმას მოწესრიგებულს ინარჩუნებს, ხოლო გრძელი შესაკრავებით დურაგს სასურველ სიმჭიდროვეზე მოირგებ.\n\nხელმისაწვდომია სხვადასხვა ფერში — ცალკე ან 6-ცალიან ნაკრებად.\n\nმიწოდება თბილისში 1–3 სამუშაო დღეში, რეგიონებში — 3–7 დღეში. თბილისში გატანა უფასოა.",
    seoTitleKa: "ატლასის დურაგები თმისთვის, გრძელი შესაკრავებით",
    seoTitleEn: "Satin Durags with Long Ties — Wave Caps for Hair",
    seoDescriptionKa: "ატლასის დურაგები გრძელი შესაკრავებით, ყოველდღიური სტილისა და თმის მოვლისთვის, სხვადასხვა ფერში. მიწოდება მთელ საქართველოში ან გატანა თბილისში.",
    seoDescriptionEn: "Satin durags with long ties for everyday style and hair care, in a range of colours. Delivery across Georgia or free pickup in Tbilisi.",
    // Membership comes from lib/echodesk/categories.ts when the catalog is live.
    products: [],
  },
];
