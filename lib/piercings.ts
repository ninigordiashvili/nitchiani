/**
 * Piercings registry — materials (used by the `MaterialTrust` PDP panel) and gauge data
 * (used by `PiercingSizeGuide`). Both are bilingual at the data level so the components
 * don't have to branch.
 *
 * Add new materials here when the catalog expands; products declare which one applies via
 * the `material` field on their dummy/Shopify record (string handle into `MATERIALS`).
 */

export type PiercingMaterial = {
  /** Stable handle, used by `product.material`. */
  handle: string;
  nameEn: string;
  nameKa: string;
  /** Top-line claim shown most prominently in the trust panel. */
  claimEn: string;
  claimKa: string;
  /** Standard/certification reference (e.g., ASTM F-136). Optional — omit if N/A. */
  certificationEn?: string;
  certificationKa?: string;
  /** Bullet-point trust facts. Kept short — readability beats completeness. */
  bulletsEn: string[];
  bulletsKa: string[];
  /** Safe for fresh / actively healing piercings? Healed-only materials get a warning. */
  freshPiercingSafe: boolean;
};

export const MATERIALS: PiercingMaterial[] = [
  {
    handle: "implant-titanium",
    nameEn: "Implant-grade titanium",
    nameKa: "იმპლანტ-კლასის ტიტანი",
    claimEn: "The gold standard for fresh piercings — biocompatible and nickel-free.",
    claimKa: "ახალი პირსინგების ოქროს სტანდარტი — ბიოშეთავსებადი და ნიკელის გარეშე.",
    certificationEn: "ASTM F-136 (ISO 5832-3)",
    certificationKa: "ASTM F-136 (ISO 5832-3)",
    bulletsEn: [
      "Safe for actively healing piercings",
      "Nickel-free, hypoallergenic",
      "Surgical-implant grade alloy",
    ],
    bulletsKa: [
      "უსაფრთხო ახალი, შემხორცებადი პირსინგებისთვის",
      "ნიკელის გარეშე, ჰიპოალერგენული",
      "ქირურგიული იმპლანტის კლასის შენადნობი",
    ],
    freshPiercingSafe: true,
  },
  {
    handle: "14k-gold",
    nameEn: "14k solid gold",
    nameKa: "14 კარატის მთლიანი ოქრო",
    claimEn: "Solid gold throughout — not plated. Safe for sensitive ears once healed.",
    claimKa: "მთლიანი ოქრო — არა გადაკრული. უსაფრთხო მგრძნობიარე ყურებისთვის შემხორცების შემდეგ.",
    bulletsEn: [
      "Genuine 14k solid gold, not plating",
      "Hypoallergenic for most wearers",
      "Best worn in fully healed piercings",
    ],
    bulletsKa: [
      "ნამდვილი 14 კარატის მთლიანი ოქრო, არა საფარი",
      "ჰიპოალერგენული უმეტეს მომხმარებლებთან",
      "საუკეთესოა სრულად შემხორცებად პირსინგებში",
    ],
    freshPiercingSafe: false,
  },
  {
    handle: "sterling-silver-925",
    nameEn: "Sterling silver 925",
    nameKa: "925 სტანდარტული ვერცხლი",
    claimEn: "92.5% pure silver. For healed piercings — silver tarnishes and isn't ideal during healing.",
    claimKa: "92.5%-იანი ვერცხლი. შემხორცებად პირსინგებისთვის — ვერცხლი ჟანგდება და არ ვარგა შემხორცების პერიოდში.",
    certificationEn: "Hallmarked 925",
    certificationKa: "გამოცდილი 925-ით",
    bulletsEn: [
      "Genuine 92.5% silver",
      "May develop natural patina over time",
      "Recommended for healed piercings only",
    ],
    bulletsKa: [
      "ნამდვილი 92.5%-იანი ვერცხლი",
      "დროთა განმავლობაში შესაძლოა ბუნებრივი პატინა გაუჩნდეს",
      "რეკომენდებულია მხოლოდ შემხორცებად პირსინგებში",
    ],
    freshPiercingSafe: false,
  },
];

export function findMaterial(handle: string | undefined): PiercingMaterial | null {
  if (!handle) return null;
  return MATERIALS.find((m) => m.handle === handle) ?? null;
}

/**
 * Gauge data for the `PiercingSizeGuide` modal. Gauges are wire-thickness; the AWG ↔ mm
 * conversion is a standard the industry follows. Common placement notes alongside each
 * gauge help buyers self-select before they read the diagrams.
 */
export type GaugeRow = {
  gauge: string;
  mm: string;
  placementsEn: string;
  placementsKa: string;
};

export const GAUGE_TABLE: GaugeRow[] = [
  {
    gauge: "20G",
    mm: "0.8mm",
    placementsEn: "Standard lobe — fine studs and small hoops",
    placementsKa: "სტანდარტული ყურის ფურცელი — წვრილი საყურეები და პატარა რგოლები",
  },
  {
    gauge: "18G",
    mm: "1.0mm",
    placementsEn: "Lobe (most common), nostril",
    placementsKa: "ყურის ფურცელი (ყველაზე გავრცელებული), ნესტო",
  },
  {
    gauge: "16G",
    mm: "1.2mm",
    placementsEn: "Helix, tragus, daith, rook, conch",
    placementsKa: "ჰელიქსი, ტრაგუსი, დაითი, რუკი, კონხი",
  },
  {
    gauge: "14G",
    mm: "1.6mm",
    placementsEn: "Septum, navel, industrial",
    placementsKa: "სეპტუმი, ჭიპი, ინდუსტრიული",
  },
  {
    gauge: "12G",
    mm: "2.0mm",
    placementsEn: "Stretched lobes, larger gauges",
    placementsKa: "გაჭიმული ფურცლები, უფრო დიდი დიამეტრები",
  },
];

/**
 * Hoop inner-diameter reference. The right diameter depends on the placement and the
 * individual's anatomy — these are starting points, not absolutes.
 */
export type HoopDiameterRow = {
  diameter: string;
  fitEn: string;
  fitKa: string;
};

export const HOOP_DIAMETERS: HoopDiameterRow[] = [
  {
    diameter: "6mm",
    fitEn: "Snug helix, tragus, small nostril hoop",
    fitKa: "მჭიდრო ჰელიქსი, ტრაგუსი, პატარა ნესტოს რგოლი",
  },
  {
    diameter: "7mm",
    fitEn: "Comfortable helix, average lobe huggie",
    fitKa: "კომფორტული ჰელიქსი, საშუალო ფურცლის huggie",
  },
  {
    diameter: "8mm",
    fitEn: "Standard lobe hoop, daith",
    fitKa: "სტანდარტული ფურცლის რგოლი, დაითი",
  },
  {
    diameter: "10mm",
    fitEn: "Lobe statement hoop, septum",
    fitKa: "ფურცლის გამოკვეთილი რგოლი, სეპტუმი",
  },
  {
    diameter: "12mm",
    fitEn: "Larger statement, septum",
    fitKa: "უფრო დიდი გამოკვეთა, სეპტუმი",
  },
];
