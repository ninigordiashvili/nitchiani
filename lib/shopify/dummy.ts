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
  /** Optional — handle from `lib/piercings.ts` materials registry. Only set on piercings. */
  material?: string;
  featuredImage: Product["featuredImage"];
  images: Product["images"];
  basePrice: number;
  baseCompareAt?: number;
  rawOptions: RawProductOption[];
  rawVariants: RawProductVariant[];
};

type RawCollection = Omit<Collection, "title" | "description" | "products"> & {
  titleKa: string;
  titleEn: string;
  descriptionKa: string;
  descriptionEn: string;
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
    material: p.material,
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
    isNew: p.isNew,
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
  isNew?: boolean;
  isBestSeller?: boolean;
  /** Option groups (e.g. Color, Size). Omit for a single-SKU product. */
  options?: RawProductOption[];
  /** Variant rows. Omit for a single-SKU product (defaults to one variant with no options). */
  variants?: RawProductVariant[];
  /** Optional material handle (lib/piercings.ts). Drives the `MaterialTrust` PDP panel. */
  material?: string;
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
    isNew: p.isNew,
    isBestSeller: p.isBestSeller,
    material: p.material,
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
    isNew: true,
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
    isNew: true,
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
    isNew: true,
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
    isNew: true,
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
    isNew: true,
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
    isNew: true,
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
    isNew: true,
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
    isNew: true,
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
    isNew: true,
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
  // — Piercings — sample SKU so the MaterialTrust panel and PiercingSizeGuide light up.
  // Add more entries with `productTypeEn: "Piercings"` to populate the collection.
  makeProduct({
    handle: "titanium-helix-stud",
    titleEn: "Titanium Helix Stud",
    titleKa: "ტიტანის ჰელიქსის საყურე",
    descriptionEn:
      "A single implant-grade titanium flat-back stud — the same alloy a piercer uses to start a new piercing. Threaded post, hand-polished bezel, comes in three gauges to fit lobe, helix or tragus placement.",
    descriptionKa:
      "ერთჯერი იმპლანტ-კლასის ტიტანის ბრტყელზურგიანი საყურე — იგივე შენადნობი, რომელსაც პროფესიონალი იყენებს ახალი პირსინგისთვის. ჭანჭკით ჩასახრახნი, ხელით გაპრიალებული ბეზელით, სამი გეიჯით — ფურცლის, ჰელიქსისა და ტრაგუსისთვის.",
    howToUseEn:
      "Sterilise hands and the piercing site with saline before each rotation. Insert the threaded post gently — never force. New piercings: leave in place for the full healing window (6–12 months for cartilage) and clean with saline twice daily.",
    howToUseKa:
      "ხელები და ჩასვმის ადგილი დაასუფთავე ფიზიოლოგიური ხსნარით ყოველი მოძრაობის წინ. ჭანჭიკიანი ღერო ფრთხილად ჩასვი — ძალით არ აიძულო. ახალი პირსინგი: დატოვე სრული შემხორცების პერიოდის განმავლობაში (6-12 თვე ხრტილისთვის) და დაასუფთავე ფიზიოლოგიური ხსნარით დღეში ორჯერ.",
    whatsInsideEn:
      "Implant-grade titanium (ASTM F-136, ISO 5832-3) · threaded post + flat back · 3mm round bezel. Ships in a recyclable card. Lifetime polish service in our Tbilisi studio.",
    whatsInsideKa:
      "იმპლანტ-კლასის ტიტანი (ASTM F-136, ISO 5832-3) · ჭანჭიკიანი ღერო + ბრტყელი ზურგი · 3მმ მრგვალი ბეზელი. იგზავნება გადამუშავებად ბარათში. სამუდამო გაპრიალების სერვისი ჩვენს თბილისის სტუდიოში.",
    aftercareEn:
      "Clean twice a day with sterile saline — morning and evening. Soak a cotton round, hold against the front and back of the piercing for 30 seconds each, then air-dry. Do not rotate the jewelry, do not use alcohol or hydrogen peroxide, do not apply creams, makeup or hair products around the piercing during healing. Sleep on a clean satin pillowcase to reduce friction. Approximate healing windows — lobe: 6–8 weeks · helix / tragus: 6–12 months · nostril: 4–6 months · septum: 6–8 weeks. Contact a professional piercer if you see green or yellow discharge, persistent swelling beyond two weeks, or develop a fever.",
    aftercareKa:
      "გაასუფთავე დღეში ორჯერ სტერილური ფიზიოლოგიური ხსნარით — დილით და საღამოს. ჩაასველე ბამბის დისკი, დაიჭირე პირსინგზე წინა და უკანა მხრიდან თითო 30 წამი, შემდეგ გააშრე ჰაერზე. არ ატრიალო საყურე, არ გამოიყენო სპირტი ან წყალბადის ზეჟანგი, არ წაიცხო კრემი, კოსმეტიკა ან თმის პროდუქტი პირსინგის ირგვლივ შემხორცების პერიოდში. იძინე სუფთა სატენის ბალიშზე ხახუნის შესამცირებლად. შემხორცების სავარაუდო პერიოდი — ფურცელი: 6-8 კვირა · ჰელიქსი / ტრაგუსი: 6-12 თვე · ნესტო: 4-6 თვე · სეპტუმი: 6-8 კვირა. დაუკავშირდი პროფესიონალ პირსერს, თუ შენიშნე მწვანე ან ყვითელი გამონადენი, ხანგრძლივი შეშუპება ორ კვირაზე მეტი ხნის განმავლობაში ან გაგიჩნდა ცხელება.",
    productTypeEn: "Piercings",
    productTypeKa: "პირსინგი",
    price: 145,
    image: "/products/titanium-helix-stud.png",
    isNew: true,
    tags: ["piercings", "titanium", "new"],
    material: "implant-titanium",
    options: [
      {
        nameEn: "Gauge",
        nameKa: "გეიჯი",
        values: [
          { en: "16G", ka: "16G" },
          { en: "18G", ka: "18G" },
          { en: "20G", ka: "20G" },
        ],
      },
    ],
    variants: [
      { optionValues: ["16G"] },
      { optionValues: ["18G"] },
      { optionValues: ["20G"] },
    ],
  }),
  // Second piercing — a 14k gold huggie hoop. Uses the `Diameter` option (instead of `Gauge`)
  // so the PiercingSizeGuide trigger gets exercised on both label paths. The 14k-gold material
  // also flips on the "healed piercings only" warning in MaterialTrust since gold isn't
  // recommended for actively healing tissue.
  makeProduct({
    handle: "gold-huggie-hoop",
    titleEn: "14k Gold Huggie Hoop",
    titleKa: "14 კარატის ოქროს Huggie რგოლი",
    descriptionEn:
      "A close-fitting hoop in solid 14k gold — the everyday hoop you stop noticing because it never catches on a sweater. Snap-clasp closure, hand-finished bezel, three diameters to fit lobe through helix.",
    descriptionKa:
      "მჭიდრო რგოლი მთლიანი 14 კარატის ოქროდან — ყოველდღიური რგოლი, რომელიც ისე იცვამ, რომ ვერ ამჩნევ — სვიტერზე არ ეჭიდება. სამაგრის სისტემით, ხელით გაპრიალებული ბეზელით, სამი დიამეტრით — ფურცლიდან ჰელიქსამდე.",
    howToUseEn:
      "Open the snap clasp gently from the hinge. Slide into the piercing, then click closed — you should hear a soft snap. For new piercings, wait until fully healed before switching to gold.",
    howToUseKa:
      "სამაგრი ფრთხილად გახსენი ჩიხის მხრიდან. გაატარე პირსინგში და დააწკაპუნე — გაიგონებ მსუბუქ ბგერას. ახალი პირსინგების შემთხვევაში დაელოდე სრულ შემხორცებას ოქროზე გადასვლამდე.",
    whatsInsideEn:
      "Solid 14k yellow gold (not plated) · snap-clasp closure · 1mm wire (18G) · 6 / 8 / 10mm inner diameters. Gift-wrapped in our Tbilisi studio.",
    whatsInsideKa:
      "მთლიანი 14 კარატის ყვითელი ოქრო (არა საფარი) · სამაგრის სისტემა · 1მმ მავთული (18G) · 6 / 8 / 10მმ შიდა დიამეტრები. შეფუთული ჩვენს თბილისის სტუდიოში.",
    aftercareEn:
      "Wear in fully healed piercings only — gold isn't recommended during active healing. To clean: wipe with a soft microfiber cloth (no chemicals, no harsh polishing). For deeper care, soak briefly in warm soapy water, rinse, pat dry. Avoid contact with perfume, hairspray and chlorine — they dull the polish over time. Store separately in a dry pouch so it doesn't scratch other pieces. Lifetime polish service available in our Tbilisi studio whenever the shine fades.",
    aftercareKa:
      "ატარე მხოლოდ სრულად შემხორცებად პირსინგებში — ოქრო არ ვარგა აქტიური შემხორცების პერიოდში. გასუფთავება: გაატარე რბილი მიკროფიბრის ნაჭრით (ქიმიური საშუალებების და მკაცრი გაპრიალების გარეშე). უფრო ღრმა მოვლისთვის ჩაუშვი თბილ საპონ წყალში, ჩამოიბანე, შრე გააშრე. მოარიდე საყურეს სუნამოს, თმის ლაქის და ქლორის შეხებას — ეს დროთა განმავლობაში აყუჩებს ბზინვარებას. შეინახე ცალკე მშრალ ჩანთაში, რომ სხვა ნივთებთან არ გაიკვრას. სამუდამო გაპრიალების სერვისი ხელმისაწვდომია ჩვენს თბილისის სტუდიოში, როდესაც ბზინვა შემცირდება.",
    productTypeEn: "Piercings",
    productTypeKa: "პირსინგი",
    price: 320,
    image: "/products/gold-huggie-hoop.png",
    isBestSeller: true,
    tags: ["piercings", "gold", "best-seller"],
    material: "14k-gold",
    options: [
      {
        nameEn: "Diameter",
        nameKa: "დიამეტრი",
        values: [
          { en: "6mm", ka: "6მმ" },
          { en: "8mm", ka: "8მმ" },
          { en: "10mm", ka: "10მმ" },
        ],
      },
    ],
    variants: [
      { optionValues: ["6mm"] },
      { optionValues: ["8mm"] },
      { optionValues: ["10mm"], available: false },
    ],
  }),
];

const productsByEnglishType = (englishType: string) =>
  DUMMY_RAW_PRODUCTS.filter((p) => p.productTypeEn === englishType);

export const DUMMY_RAW_COLLECTIONS: RawCollection[] = [
  {
    id: "gid://nitchiani/Collection/best-sellers",
    handle: "best-sellers",
    titleEn: "Best Sellers",
    titleKa: "ბესტსელერები",
    descriptionEn: "Our most-loved pieces.",
    descriptionKa: "ჩვენი ყველაზე საყვარელი ნივთები.",
    products: DUMMY_RAW_PRODUCTS.filter((p) => p.isBestSeller),
  },
  {
    id: "gid://nitchiani/Collection/new-arrivals",
    handle: "new-arrivals",
    titleEn: "New Arrivals",
    titleKa: "ახალი ჩამოსვლა",
    descriptionEn: "Fresh from the studio.",
    descriptionKa: "ახლადჩამოსული სტუდიოდან.",
    products: DUMMY_RAW_PRODUCTS.filter((p) => p.isNew),
  },
  {
    id: "gid://nitchiani/Collection/bonnets",
    handle: "bonnets",
    titleEn: "Bonnets",
    titleKa: "ბონნეტები",
    descriptionEn: "Silk and satin bonnets for overnight protection.",
    descriptionKa: "აბრეშუმისა და სატენის ბონნეტები ღამის დაცვისთვის.",
    image: { url: "/categories/bonnets.png", altText: "Bonnets" },
    products: productsByEnglishType("Bonnets"),
  },
  {
    id: "gid://nitchiani/Collection/loc-care",
    handle: "loc-care",
    titleEn: "Loc Care",
    titleKa: "ლოკსების მოვლა",
    descriptionEn: "Oils, rinses, gels — everything your locs need.",
    descriptionKa: "ზეთები, ჩამოსარეცხები, გელები — ყველაფერი, რაც შენს ლოკსებს სჭირდება.",
    image: { url: "/categories/loc-care.png", altText: "Loc Care" },
    products: productsByEnglishType("Loc Care"),
  },
  {
    id: "gid://nitchiani/Collection/accessories",
    handle: "accessories",
    titleEn: "Accessories",
    titleKa: "აქსესუარები",
    descriptionEn: "Pillowcases, cuffs, beads, and more.",
    descriptionKa: "ბალიშის გარსები, მანჟეტები, მძივები და სხვა.",
    image: { url: "/categories/accessories.png", altText: "Accessories" },
    products: productsByEnglishType("Accessories"),
  },
  {
    id: "gid://nitchiani/Collection/extensions",
    handle: "extensions",
    titleEn: "Extensions",
    titleKa: "ექსტენშენები",
    descriptionEn: "Premium human hair extensions, ethically sourced.",
    descriptionKa: "პრემიუმ ბუნებრივი თმის ექსტენშენები, ეთიკური წარმოშობით.",
    image: { url: "/categories/extensions.png", altText: "Extensions" },
    products: productsByEnglishType("Extensions"),
  },
  {
    id: "gid://nitchiani/Collection/tools",
    handle: "tools",
    titleEn: "Tools",
    titleKa: "ხელსაწყოები",
    descriptionEn: "Picks, combs, and styling tools.",
    descriptionKa: "პიკები, სავარცხლები და სტილისტური ხელსაწყოები.",
    image: { url: "https://picsum.photos/seed/nitchiani-tools/1200/900", altText: "Tools" },
    products: productsByEnglishType("Tools"),
  },
  {
    // Piercing accessories — scaffolded empty for now. Add products with `productType: "Piercings"`
    // (and the matching localised type via `productTypeHandle: "piercings"`) when the line launches.
    id: "gid://nitchiani/Collection/piercings",
    handle: "piercings",
    titleEn: "Piercings",
    titleKa: "პირსინგი",
    descriptionEn: "Hand-finished studs, hoops and cuffs — the same Tbilisi-studio craft as our hair pieces.",
    descriptionKa: "ხელით დამზადებული საყურეები, რგოლები და მანჟეტები — იგივე თბილისური სტუდიური ხელობა, რაც ჩვენი თმის ნივთები.",
    image: { url: "/categories/piercings.png", altText: "Piercings" },
    products: productsByEnglishType("Piercings"),
  },
];
