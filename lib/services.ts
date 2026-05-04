export type Service = {
  slug: string;
  titleKa: string;
  titleEn: string;
  descKa: string;
  descEn: string;
  durationMinutes: number;
  priceFrom: number;
  image: string;
  calEventType: string;
};

export const SERVICES: Service[] = [
  {
    slug: "box-braids",
    titleKa: "ბოქს ბრეიდები",
    titleEn: "Box Braids",
    descKa: "სუფთა, ხანგრძლივი სტილი — ხელით ნაკეთი ჩვენი სტუდიოში.",
    descEn: "Clean, long-lasting style — hand-installed in our studio.",
    durationMinutes: 240,
    priceFrom: 250,
    image: "/services/box-braids.jpg",
    calEventType: "box-braids",
  },
  {
    slug: "starter-locs",
    titleKa: "ლოკსების დაწყება",
    titleEn: "Starter Locs",
    descKa: "შენი ლოკსების მოგზაურობის დასაწყისი — სუფთა ნაწილებად ნაკეთი.",
    descEn: "Begin your loc journey — meticulously parted and started.",
    durationMinutes: 360,
    priceFrom: 400,
    image: "/services/starter-locs.jpg",
    calEventType: "starter-locs",
  },
  {
    slug: "cornrows",
    titleKa: "კორნროუზი",
    titleEn: "Cornrows",
    descKa: "ხელით ნაკეთი კორნროუზის ფრჩხები — სუფთა ხაზები, დაცვითი სტილი ხანგრძლივობით.",
    descEn: "Hand-braided cornrows — clean lines, protective styling that lasts for weeks.",
    durationMinutes: 180,
    priceFrom: 200,
    image: "/services/cornrows.jpg",
    calEventType: "cornrows",
  },
];

export function getServiceBySlug(slug: string) {
  return SERVICES.find((s) => s.slug === slug);
}
