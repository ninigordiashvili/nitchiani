import type { Locale } from "./i18n/config";

/**
 * Hand-written testimonials per product. KA + EN bodies; metadata (name, city, date, rating)
 * is shared across locales. When real Shopify reviews arrive (e.g. Judge.me / Yotpo / Shopify
 * Product Reviews), this getter is what swaps — the consumer surface stays the same.
 *
 * Cities lean Tbilisi + a few diaspora-Tbilisian touches (Batumi, Kutaisi, Berlin) so the
 * brand reads as locally rooted but globally aware.
 */

export type Review = {
  id: string;
  author: string;
  city: string;
  /** ISO date — used for sort + "X days ago" formatting later. */
  date: string;
  /** Whole or half stars, 0–5. */
  rating: number;
  bodyKa: string;
  bodyEn: string;
};

export type LocalizedReview = {
  id: string;
  author: string;
  city: string;
  date: string;
  rating: number;
  body: string;
};

const REVIEWS_BY_HANDLE: Record<string, Review[]> = {
  "silk-bonnet-noir": [
    {
      id: "rv-bonnet-1",
      author: "Mariam K.",
      city: "Tbilisi",
      date: "2026-04-12",
      rating: 5,
      bodyKa: "ჩემი ლოკსები დილით ბევრად სუფთა და მოწესრიგებულია. ელასტიკური ზომა იდეალურია — ღამე არ ვგრძნობ.",
      bodyEn: "My locs look so much smoother in the morning. The elastic is perfect — I don't even feel it overnight.",
    },
    {
      id: "rv-bonnet-2",
      author: "Nino T.",
      city: "Batumi",
      date: "2026-03-28",
      rating: 5,
      bodyKa: "ნამდვილად აბრეშუმი — განსხვავება ჩანს. ფარული ჯიბე უკვე ვერ ვცხოვრობ მის გარეშე.",
      bodyEn: "Real silk — you can feel the difference. Hidden inner band? Game changer.",
    },
    {
      id: "rv-bonnet-3",
      author: "Luka G.",
      city: "Tbilisi",
      date: "2026-02-14",
      rating: 4,
      bodyKa: "კარგი ხარისხი, ძალიან მოსახერხებელი. შემეძლო ცოტა უფრო დიდი ზომა მერჩივნა, მაგრამ მაინც კმაყოფილი ვარ.",
      bodyEn: "Great quality, very comfortable. Would've liked a slightly larger size option, but still happy.",
    },
  ],
  "loc-care-oil-15ml": [
    {
      id: "rv-oil-1",
      author: "Salome D.",
      city: "Tbilisi",
      date: "2026-04-20",
      rating: 5,
      bodyKa: "სცენტი არ არის ძლიერი, ცხიმი არ რჩება. ერთი წვეთი საკმარისია მთელი დღისთვის.",
      bodyEn: "Light scent, no greasy residue. One drop covers a whole day for me.",
    },
    {
      id: "rv-oil-2",
      author: "Ana B.",
      city: "Tbilisi",
      date: "2026-04-02",
      rating: 5,
      bodyKa: "ჩაის ხის სუნი თავის კანს ნამდვილად ხელს უწყობს. 30მლ ჩემთვის უკეთესი ვარიანტია.",
      bodyEn: "The tea tree note really helps my scalp. Going with the 30ml refill from now on.",
    },
    {
      id: "rv-oil-3",
      author: "Tako M.",
      city: "Kutaisi",
      date: "2026-03-15",
      rating: 4,
      bodyKa: "კარგი ფასი, ლამაზი ფლაკონი. ტუმბო ცოტა რთულია, მაგრამ შინაარსი შესანიშნავია.",
      bodyEn: "Good price, beautiful bottle. Pump can be tricky but the formula is excellent.",
    },
  ],
  "wood-loc-pick": [
    {
      id: "rv-pick-1",
      author: "Tornike Sh.",
      city: "Tbilisi",
      date: "2026-04-05",
      rating: 5,
      bodyKa: "ხის პიკი რომელიც თმას არ აზიანებს. 0.75მმ-ი იდეალურია სქელი ლოკსებისთვის.",
      bodyEn: "Wood pick that doesn't tug. 0.75mm is perfect for thicker locs.",
    },
    {
      id: "rv-pick-2",
      author: "Eka L.",
      city: "Tbilisi",
      date: "2026-03-22",
      rating: 5,
      bodyKa: "მშვენიერი ხელნაკეთი ნივთი. ხელში კარგად ინახება და ლამაზად გამოიყურება.",
      bodyEn: "Beautiful handcrafted piece. Sits well in the hand and looks gorgeous on the vanity.",
    },
  ],
  "satin-pillowcase-cream": [
    {
      id: "rv-pillow-1",
      author: "Lika P.",
      city: "Tbilisi",
      date: "2026-04-18",
      rating: 5,
      bodyKa: "კანიც და თმაც აღფრთოვანებულია. ფარული ზიპი ნამდვილად განსხვავებაა — არ ეჩხვლეტება.",
      bodyEn: "My skin and hair both love it. Hidden zip really matters — no scratching at night.",
    },
    {
      id: "rv-pillow-2",
      author: "Maia R.",
      city: "Berlin",
      date: "2026-03-30",
      rating: 5,
      bodyKa: "ვაგზავნიდი ბერლინში დას-მა. მოვიდა შესანიშნავ შეფუთვაში. ხარისხი პრემიუმია.",
      bodyEn: "Sent one to my sister in Berlin. Arrived in beautiful packaging. Premium quality.",
    },
    {
      id: "rv-pillow-3",
      author: "Nina A.",
      city: "Tbilisi",
      date: "2026-02-19",
      rating: 4,
      bodyKa: "კრემისფერი ფერი ლამაზია, მაგრამ ცოტა უფრო ღრმა შავი ვერსია მინდა.",
      bodyEn: "Cream is lovely but I want a deeper noir version too.",
    },
  ],
  "human-hair-extension-22-noir": [
    {
      id: "rv-ext-1",
      author: "Tea V.",
      city: "Tbilisi",
      date: "2026-04-22",
      rating: 5,
      bodyKa: "ბუნებრივი ხარისხი ნამდვილად ჩანს. 22\" სრულყოფილი სიგრძეა ჩემი ფრჩხებისთვის.",
      bodyEn: "You can really see the human-hair quality. 22\" is the perfect length for my braids.",
    },
    {
      id: "rv-ext-2",
      author: "Keti J.",
      city: "Tbilisi",
      date: "2026-04-08",
      rating: 5,
      bodyKa: "მე-3 შეკვეთა. ყოველთვის თანმიმდევრული. სალონში ყველა მეკითხება სად ვიყიდე.",
      bodyEn: "Third order. Always consistent. Everyone at the salon asks where I got it.",
    },
  ],
  "loc-detox-rinse": [
    {
      id: "rv-rinse-1",
      author: "Sophie M.",
      city: "Tbilisi",
      date: "2026-04-14",
      rating: 5,
      bodyKa: "თვეში ერთხელ ვიყენებ — ლოკსები იწერება ისე, თითქოს თავიდან გაკეთებული მაქვს.",
      bodyEn: "Use it monthly — leaves my locs feeling brand new.",
    },
    {
      id: "rv-rinse-2",
      author: "Anna K.",
      city: "Tbilisi",
      date: "2026-03-25",
      rating: 4,
      bodyKa: "ვაშლის ძმარს რა შესახებ ვიცი — ეფექტურია. სცენტი კი ცოტა მკვეთრია, მაგრამ მალე ქრება.",
      bodyEn: "ACV does its job — really effective. Scent is sharp at first but fades quickly.",
    },
  ],
  "edge-control-mini": [
    {
      id: "rv-edge-1",
      author: "Ela G.",
      city: "Tbilisi",
      date: "2026-04-10",
      rating: 5,
      bodyKa: "მინი ზომა იდეალურია ჩანთაში. დაკავება მთელი დღე ნამდვილია, ფიფქების გარეშე.",
      bodyEn: "Mini size is perfect for my purse. All-day hold, zero flake — for real.",
    },
  ],
  "gold-loc-cuff-set": [
    {
      id: "rv-cuff-1",
      author: "Mari O.",
      city: "Tbilisi",
      date: "2026-04-16",
      rating: 5,
      bodyKa: "ოქროს ფერი ლამაზია, არ ხდება მუქი დროის გასვლისას. რეგულირებადი ზომა ნამდვილად მუშაობს.",
      bodyEn: "Gold tone is gorgeous and doesn't tarnish. Adjustable sizing actually works.",
    },
    {
      id: "rv-cuff-2",
      author: "Nata T.",
      city: "Tbilisi",
      date: "2026-03-19",
      rating: 4,
      bodyKa: "ბევრი მაქვს, ყოველ ჯერზე სხვადასხვა ფრჩხასთან მახარებენ. 16-ის ნაკრები უკეთესი ფასია.",
      bodyEn: "I have many — different look for every braid set. The 16-pack is better value.",
    },
  ],
};

export function getReviewsForProduct(handle: string, locale: Locale): LocalizedReview[] {
  const reviews = REVIEWS_BY_HANDLE[handle] ?? [];
  return reviews
    .slice()
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .map((r) => ({
      id: r.id,
      author: r.author,
      city: r.city,
      date: r.date,
      rating: r.rating,
      body: locale === "ka" ? r.bodyKa : r.bodyEn,
    }));
}

export function getReviewSummary(handle: string): { count: number; average: number } {
  const reviews = REVIEWS_BY_HANDLE[handle] ?? [];
  if (reviews.length === 0) return { count: 0, average: 0 };
  const total = reviews.reduce((sum, r) => sum + r.rating, 0);
  return {
    count: reviews.length,
    // round to 1 decimal
    average: Math.round((total / reviews.length) * 10) / 10,
  };
}
