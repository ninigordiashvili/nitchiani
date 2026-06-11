/**
 * Journal — editorial posts that build brand depth + SEO surface area. Stored as data
 * (not MDX) so we can ship in both Georgian and English from one file, with the same
 * routing pattern used by `services` and `bundles`.
 *
 * Each `body` field is plain text with `\n\n` paragraph breaks. Rendered through a
 * single `<p>` per paragraph in the post page — no rich HTML, no markdown parser.
 * Future hook: swap to MDX when we have inline images / pull-quotes worth the cost.
 */

export type JournalPost = {
  slug: string;
  /** ISO date, e.g. "2026-05-19". Used in sitemap `lastModified` + post header. */
  publishedAt: string;
  /** Rough minutes-to-read; shown next to the date. Compute once, hand-tuned. */
  readingMinutes: number;
  /** Card image. 4:3 aspect on the index, hero 16:9 on the post page. */
  image: string;
  titleEn: string;
  titleKa: string;
  excerptEn: string;
  excerptKa: string;
  bodyEn: string;
  bodyKa: string;
  /** Author byline, localised. Surfaced on the index card, detail header, and Article JSON-LD. */
  authorEn: string;
  authorKa: string;
};

/** Default author used when a post doesn't declare its own. The studio voice. */
export const DEFAULT_AUTHOR_EN = "Nini Gordiashvili";
export const DEFAULT_AUTHOR_KA = "ნინი გორდიაშვილი";

export const JOURNAL_POSTS: JournalPost[] = [
  {
    slug: "why-silk-bonnet",
    publishedAt: "2026-05-12",
    readingMinutes: 4,
    image: "/journal/why-silk-bonnet.jpg",
    titleEn: "Why a silk bonnet, and why ours",
    titleKa: "რატომ აბრეშუმის ბონნეტი — და რატომ ჩვენი",
    authorEn: DEFAULT_AUTHOR_EN,
    authorKa: DEFAULT_AUTHOR_KA,
    excerptEn:
      "Cotton pillowcases pull moisture from locs all night. A real silk bonnet — not satin, not blended — is the cheapest move you can make for healthier hair.",
    excerptKa:
      "ბამბის ბალიში მთელი ღამის განმავლობაში თმიდან ტენიანობას იწოვს. ნამდვილი აბრეშუმის ბონნეტი — არა სატენი, არა შერეული — ყველაზე იაფი ნაბიჯია ჯანსაღი თმისთვის.",
    bodyEn:
      "If your locs feel brittle by the end of the week, the cause is almost never your wash routine — it's eight hours of cotton friction every night. Cotton fibres are absorbent (good for towels, bad for hair); they wick the oil you just applied right off the strand. They also create micro-snags that, multiplied across months, are exactly what tips a freshly retwisted loc into frizz.\n\n" +
      "Satin solves the friction problem but not the moisture one. Polyester satin is still synthetic — it doesn't breathe, doesn't absorb sweat, and on a Tbilisi summer night you end up with a damp scalp. It also feels slick in the hand: the same slipperiness that lets it slide off your head at 3am.\n\n" +
      "Mulberry silk is the upgrade. The fibres are protein-based, so they're chemically closer to hair than any plastic ever will be. They glide instead of grab. They hold body heat without trapping moisture. And because mulberry silk is woven tight (we use 22-momme), it doesn't shred at the seams the way 16-momme bedding silks do after a few washes.\n\n" +
      "What we ship: a single layer of 22-momme mulberry silk, double-stitched, with a soft elastic that holds without leaving a forehead mark. Hand-finished in our Tbilisi studio. One year of nightly wear, machine-washed cold on delicate, and ours still looks new — that's the bar.\n\n" +
      "If you're new to bonnets, sleep in it for a week before you decide. Your morning will tell you everything.",
    bodyKa:
      "თუ კვირის ბოლოს თმა მტვრევადი გრძნობით გაქვს, მიზეზი თითქმის არასოდეს გახდენილია სარეცხ რეჟიმში — რვა საათი ბამბის ხახუნი ყოველ ღამე საქმეს აშავებს. ბამბის ბოჭკოები ტენიანობას შთანთქავს (კარგია პირსახოცებისთვის, ცუდი თმისთვის); ის ზეთი, რომელიც ახლახან ჩაიკეთე, ბამბაში გადადის. ამავდროულად, ბამბა ქმნის მიკრო-ჩასვამებს, რომლებიც თვეების განმავლობაში ფრიზს იწვევენ.\n\n" +
      "სატენი ხახუნის პრობლემას წყვეტს, მაგრამ ტენიანობას არა. პოლიესტერის სატენი მაინც სინთეტიკაა — არ სუნთქავს, არ შთანთქავს ოფლს, და თბილისის ზაფხულის ღამეს თავის კანი ნოტიო გრჩება. სრიალს გრძნობ ხელშიც: იგივე სრიალი ღამის სამ საათზე ბონნეტს თავიდან გადააგდებინებს.\n\n" +
      "თუთის აბრეშუმი არის გადაწყვეტა. ბოჭკოები ცილოვანია, ანუ ქიმიურად თმასთან ბევრად უფრო ახლოს, ვიდრე ნებისმიერი პლასტმასი. ნაცვლად მისი, რომ ხახუნი მისცეს, ის სრიალებს. ინარჩუნებს სხეულის სითბოს და არ ატენიანებს. და რადგან თუთის აბრეშუმი მკვრივად ნაქსოვია (ჩვენ ვიყენებთ 22 მომეს), ნაკერებზე არ იშლება, ისე როგორც 16-მომიანი თეთრეულის აბრეშუმი რამდენიმე რეცხვის შემდეგ.\n\n" +
      "რას ვაგზავნით: ერთფენიანი 22-მომიანი თუთის აბრეშუმი, ორმაგად ნაკერი, რბილი ელასტიკით, რომელიც კარგად იჭერს, მაგრამ შუბლზე კვალს არ ტოვებს. ხელით ნაკეთი ჩვენს თბილისის სტუდიოში. ერთი წელი ყოველღამიური გამოყენების და ცივი მანქანური რეცხვის შემდეგ — ჩვენი მაინც ახალივით გამოიყურება. ეს არის სტანდარტი.\n\n" +
      "თუ პირველად სცადე ბონნეტი, ერთი კვირა იძინე მასში სანამ გადაწყვეტ. დილა ყველაფერს იტყვის.",
  },
  {
    slug: "loc-oil-routine",
    publishedAt: "2026-05-06",
    readingMinutes: 5,
    image: "/journal/loc-oil-routine.jpg",
    titleEn: "A weekly oil routine that actually works on mature locs",
    titleKa: "ყოველკვირეული ზეთის რეჟიმი, რომელიც მართლაც მუშაობს მომწიფებულ ლოკსებზე",
    authorEn: DEFAULT_AUTHOR_EN,
    authorKa: DEFAULT_AUTHOR_KA,
    excerptEn:
      "More oil isn't better — placement is. Here's the three-step routine we recommend at the studio, broken down by phase: scalp, shaft, ends.",
    excerptKa:
      "მეტი ზეთი არ ნიშნავს უკეთესს — განთავსება უფრო მნიშვნელოვანია. სტუდიოში ვურჩევთ სამეტაპიან რეჟიმს: თავის კანი, ღერო, ბოლოები.",
    bodyEn:
      "Most loc oiling goes wrong in the first thirty seconds — people drench the whole head with one pour. The result is a heavy scalp, a slippery shaft, and dry ends that needed the oil most. The fix is sequencing: treat the scalp, the shaft, and the ends as three different problems with three different doses.\n\n" +
      "**Scalp (Sunday night).** Section the hair into four quadrants. Apply two drops of oil per quadrant — eight drops total, not a palmful — directly to the parting line, then massage in circles for sixty seconds per quadrant. The goal isn't saturation; it's stimulating blood flow. Sixty seconds is non-negotiable. Set a timer.\n\n" +
      "**Shaft (mid-week refresh, Wednesday).** Cup three drops of oil between your palms, rub them flat, and pull each loc through your closed fist from root to tip. You should feel a faint warmth — that's friction generating the absorption. If your hand comes away glossy, you used too much; cut the dose next time.\n\n" +
      "**Ends (every night before bed).** This is where people skip and where damage compounds. One drop of oil rubbed between fingertips, pressed onto the last inch of each loc. Then bonnet up. This is the difference between locs that fray at year two and locs that don't.\n\n" +
      "The oil we make for this routine is the **Follicle Nutrient Oil** — cold-pressed castor for the scalp work, golden jojoba (chemically closest to your scalp's own sebum) for the shaft, tea tree to keep buildup down. Lightweight enough that you can do the Wednesday refresh in the morning without a greasy aftertaste in the afternoon.\n\n" +
      "Two notes: never go past three drops on the scalp in one sitting — castor is heavy and will sit on the skin. And don't oil within 24 hours of a retwist; let the new bond set first.",
    bodyKa:
      "ლოკსების ზეთვა უმეტესობას პირველი ოცდაათ წამში არასწორად მიდის — ხალხი მთელ თავს ერთი დასხმით ასველებს. შედეგი — დატვირთული თავის კანი, მცოცავი ღერო და მშრალი ბოლოები, რომლებსაც ყველაზე მეტად სჭირდებოდათ. გადაწყვეტა თანმიმდევრულობაშია: მოექეცი თავის კანს, ღეროს და ბოლოებს როგორც სამ სხვადასხვა პრობლემას სამი სხვადასხვა დოზით.\n\n" +
      "**თავის კანი (კვირას საღამოს).** გაყავი თმა ოთხ ნაწილად. დაასხი ორი წვეთი ზეთი თითო ნაწილზე — სულ რვა წვეთი, არა ხელის სავსე — პირდაპირ გასაყოფ ხაზზე და სცადე წრიული მასაჟი 60 წამის განმავლობაში. მიზანი არ არის გაჯერება — სისხლის მიმოქცევის გააქტიურებაა. 60 წამზე ნაკლები არ გამოვა. ჩართე ტაიმერი.\n\n" +
      "**ღერო (კვირის შუა გადახალისება, ოთხშაბათს).** ხელის გულებში დააწვეთე სამი წვეთი ზეთი, გადაანაწილე და ყოველი ლოკსი გაატარე დახურულ მუშტში ფესვიდან ბოლომდე. უნდა იგრძნო მსუბუქი სითბო — ეს ხახუნი იწვევს შთანთქმას. თუ ხელი მკრთალდება — ძალიან ბევრი დაასხი. შემდეგ ჯერზე შეამცირე.\n\n" +
      "**ბოლოები (ყოველ ღამე ძილის წინ).** აქ ხალხი გამოტოვებს, აქ ზიანი გროვდება. ერთი წვეთი ზეთი თითებზე გაანაწილე და დაატანე თითო ლოკსის ბოლო ერთ ინჩზე. შემდეგ — ბონნეტი. ეს არის განსხვავება მე-2 წელს გაცვეთილ ბოლოებსა და მთლიან ლოკსს შორის.\n\n" +
      "ამ რეჟიმისთვის ჩვენი დამზადებული ზეთი არის **Follicle Nutrient Oil** — ცივი დაწურვის კასტორი თავის კანისთვის, ოქროსფერი ჯოჯობა (ქიმიურად ყველაზე ახლოს თავის კანის ბუნებრივ სებუმთან) ღეროსთვის, ჩაის ხე — დაგროვების საწინააღმდეგოდ. საკმარისად მსუბუქი, რომ ოთხშაბათის გადახალისება დილით გააკეთო და შუადღეს ცხიმიანი გრძნობა არ შეგრჩეს.\n\n" +
      "ორი შენიშვნა: არასოდეს გადააჭარბო სამ წვეთს თავის კანზე ერთ ჯერზე — კასტორი მძიმეა და კანზე დარჩება. და არ დაიზეთო რეტვისტიდან 24 საათში; ჯერ ახალი კავშირი დადგეს.",
  },
  {
    slug: "why-we-cold-press",
    publishedAt: "2026-04-28",
    readingMinutes: 3,
    image: "/journal/why-we-cold-press.jpg",
    titleEn: "Why we cold-press, and what's in the bottle because of it",
    titleKa: "რატომ ვაკეთებთ ცივ დაწურვას — და რა მონაცემები რჩება ბოთლში",
    authorEn: DEFAULT_AUTHOR_EN,
    authorKa: DEFAULT_AUTHOR_KA,
    excerptEn:
      "Cold-pressing costs more, yields less, and takes longer. We do it because heat kills the compounds you're paying for.",
    excerptKa:
      "ცივი დაწურვა უფრო ძვირია, ნაკლებ პროდუქტს იძლევა და მეტ დროს იღებს. ჩვენ ვაკეთებთ რადგან სითბო კლავს იმ ნაერთებს, რომლებსაც ფულს იხდი.",
    bodyEn:
      "Industrial castor oil is produced one way: heat the seeds, press them at 80–90°C, then bleach and deodorise the result with solvents. The yield is generous, the oil is clear, and the supply chain is cheap. It's also nutritionally hollow — the tocopherols (vitamin E family), the polyphenols, and most of the ricinoleic-acid integrity that makes castor work on hair are degraded by the time the oil reaches the bottle.\n\n" +
      "Cold-pressed castor is processed under 40°C, with no chemical solvents and no deodorising step. It comes out amber, slightly cloudy, and smells like seeds — because it still is them, basically. Yield is roughly 60% of the hot-press equivalent, which is why you'll rarely see it on a supermarket shelf. We accept the lower yield because the vitamin E and the polyphenols are exactly the compounds that make castor heal the scalp instead of just sitting on it.\n\n" +
      "Same logic for the jojoba. Most jojoba on the market is refined and clear; ours is golden because we leave the carotenoids in. Carotenoids are what give the oil its sebum-mimicking properties — strip them out for shelf-life and you're left with a slip aid, nothing more.\n\n" +
      "The tea tree is a different game. It's distilled, not pressed, but the same rule applies — slow, low-temperature distillation preserves the terpenes that do the antimicrobial work. We source ours single-batch from a co-operative in Queensland.\n\n" +
      "Practical consequences for you: our oils have a 12-month shelf life instead of 24, they look a little cloudy in winter (the castor solidifies below 12°C — warm the bottle in your hand for a minute and it's fine), and they cost ~25% more per millilitre than the hot-pressed alternative. We won't quietly switch. If you've moved from supermarket castor to ours and your scalp settled within two weeks, this is why.",
    bodyKa:
      "ინდუსტრიული კასტორის ზეთის წარმოება ერთი მეთოდით ხდება: თესლები გათბება 80-90°C-მდე, შემდეგ დაიწურება, შემდეგ კი ხსნადებით გაუფერულდება და უსუნდება. გამოსავალი დიდია, ზეთი გამჭვირვალე, მიწოდების ჯაჭვი იაფი. ის ასევე კვებითად ცარიელია — ტოკოფეროლები (E ვიტამინი), პოლიფენოლები და რიცინოლეინის მჟავას უმეტესობა — ის ნაერთები, რომლებიც ხდიან კასტორს თმისთვის ეფექტურს — დეგრადირებულია სანამ ბოთლში მოხვდება.\n\n" +
      "ცივი დაწურვის კასტორი მუშავდება 40°C-ზე ნაკლებ ტემპერატურაზე, ქიმიური ხსნადების და უსუნოდ მიქცევის ეტაპის გარეშე. გამოდის ქარვისფერი, ცოტა ბურუსიანი, თესლის სუნით — რადგან არსებითად ისევ თესლია. გამოსავალი ცხელი დაწურვის დაახლოებით 60%-ია, ამიტომაც იშვიათად ხედავთ მას სუპერმარკეტის თაროზე. ჩვენ ვეგუებით ნაკლებ გამოსავალს, რადგან ვიტამინი E და პოლიფენოლები ზუსტად ის ნაერთებია, რომლებიც კასტორს თავის კანის შემაჯანსაღებლად აქცევენ — ნაცვლად იმისა, რომ ზედაპირზე იწვეს.\n\n" +
      "იგივე ლოგიკა ჯოჯობასთვისაც. ბაზარზე ჯოჯობა ძირითადად დახვეწილია და გამჭვირვალე; ჩვენი ოქროსფერია, რადგან კაროტინოიდებს ვტოვებთ. ეს ნაერთებია, რომლებიც ზეთს სებუმს ამსგავსებენ — თუ მათ წავიღებთ ხანგრძლივობისთვის, რჩება მხოლოდ მცოცავი ნივთიერება.\n\n" +
      "ჩაის ხე სხვა ისტორიაა. ის დისტილირდება, არა იწურება — მაგრამ იგივე წესი მუშაობს: ნელი, დაბალტემპერატურული დისტილაცია ინარჩუნებს ტერპენებს, რომლებიც ანტიმიკრობულ მუშაობას ასრულებენ. ჩვენი ერთჯერადი პარტიით მოდის ქვინზლენდიდან, ერთი კოოპერატივიდან.\n\n" +
      "პრაქტიკული შედეგი შენთვის: ჩვენი ზეთები 12 თვის ვადით ინახება 24-ის ნაცვლად, ზამთარში ცოტა ბურუსიანი ხდება (კასტორი 12°C-ზე ქვემოთ მყარდება — ბოთლი ხელში ერთი წუთი გათბე და დაუბრუნდება), და მილილიტრზე დაახლოებით 25%-ით ძვირია, ვიდრე ცხელი დაწურვის ალტერნატივა. ჩვენ ჩუმად არ შევცვლით. თუ სუპერმარკეტის კასტორიდან ჩვენთან გადახვედი და თავის კანი ორ კვირაში დაშოშმინდა — ეს არის ახსნა.",
  },
  {
    slug: "how-long-piercings-actually-heal",
    publishedAt: "2026-05-20",
    readingMinutes: 6,
    image: "/journal/piercing-aftercare.jpg",
    titleEn: "How long until your piercing actually heals",
    titleKa: "რამდენი ხანი დასჭირდება შენი პირსინგის რეალურ შემხორცებას",
    authorEn: DEFAULT_AUTHOR_EN,
    authorKa: DEFAULT_AUTHOR_KA,
    excerptEn:
      "The healing windows most studios understate — and the daily routine that gets you there without infection, swelling or starting over.",
    excerptKa:
      "შემხორცების რეალური დრო, რომელსაც სტუდიოები იშვიათად გეუბნებიან — და ყოველდღიური რუტინა, რომელიც ინფექციის, შეშუპებისა და თავიდან დაწყების გარეშე გადარჩება.",
    bodyEn:
      "Most piercings look healed in two weeks. That's the trap — the outside skin closes long before the tissue underneath does, and the moment you swap to the wrong jewelry or skip a cleaning you're back at week one. What you're paying for at a real studio is the right metal during the slow phase, not just the puncture itself.\n\n" +
      "**The real healing windows.** Lobes: 6–8 weeks (the fastest, because the tissue is fatty and well-perfused). Helix, tragus, daith, rook, conch: 6–12 months. Nostril: 4–6 months. Septum: 6–8 weeks. Industrial: 9–12 months because two openings have to settle in sync. These are minimums — if you sleep on it wrong for a week, the clock partially resets.\n\n" +
      "**The two-saline-rinses rule.** Twice a day, morning and evening — sterile saline (the kind sold for piercings, or 0.9% sodium chloride, never the table-salt-in-water mixture older guides recommended). Soak a cotton round, hold it against the front for 30 seconds, then the back for 30 seconds, then air-dry. Do not rotate the jewelry. Rotation tears the just-formed tissue and is the single biggest reason people think a piercing is rejecting when it's actually just being aggravated.\n\n" +
      "**What \"healed\" actually means.** A piercing is healed when the inside of the channel (not just the entrance) has become smooth tissue that no longer bleeds when you change jewelry. The skin can look perfectly normal months before the channel is done. If you switch from your initial titanium to gold and start oozing again two days later, you switched too early — go back to titanium for another month.\n\n" +
      "**Why titanium first, gold later.** Implant-grade titanium is the only material studios should be using for a fresh piercing. It's biocompatible, nickel-free, and doesn't react with the wound fluid that's around for the first few months. 14k gold is hypoallergenic but tarnishes minutely as it sits in healing fluid, and that's enough to irritate sensitive tissue. Once you're fully healed (real healed, not skin-healed), gold becomes the everyday move.\n\n" +
      "**Warning signs vs normal.** Normal during weeks 1–6: clear or pale-yellow crust at the entrance, slight redness, occasional itch, tenderness when bumped. Not normal at any point: thick green or yellow discharge, swelling that's getting worse not better after week two, a persistent throbbing pain, or fever. If you see any of these, message us or your piercer — a downgrade in jewelry size + targeted cleaning usually resolves it; in rare cases you need a doctor.\n\n" +
      "**The things that wreck healing without you noticing.** Sleeping on the piercing (use a satin pillowcase and switch sides). Hair products around the area — dry shampoo, hairspray, leave-in conditioner all leave residues that sit in the channel. Earbuds against fresh cartilage piercings. Pulling shirts over a fresh nipple piercing. Swimming in chlorinated pools or the sea (the sea is actually worse for piercings — saltier than the body, draws fluid out, and the bacteria load is high). Wait 4–6 weeks before any of these.\n\n" +
      "**The shortcut nobody tells you.** Most aftercare advice you'll read online is for people piercing themselves with surgical steel from Amazon. If you started with implant-grade titanium from a proper studio, your healing is already 30–40% faster than the worst-case timelines you'll find on Reddit. Don't take advice calibrated for cheap metal as your baseline.\n\n" +
      "Studio courtesy: if you bought a piece from us and the healing isn't going right, send a photo over WhatsApp. We'll tell you straight whether it's normal, whether to come in for a downsize, or whether you need a doctor. Most check-ins take under a minute and most worries turn out to be nothing.",
    bodyKa:
      "უმეტესობა პირსინგი ორ კვირაში გარეგნულად შემხორცებული გამოიყურება. ეს არის ხაფანგი — გარე კანი დიდი ხნით ადრე იხურება, ვიდრე შიდა ქსოვილი, და თუ ამ მომენტში არასწორ საყურეზე გადახვალ ან გასუფთავება გამოტოვე — დაბრუნდები პირველ კვირაში. რეალურ სტუდიოში ფული გადახდილია სწორი ლითონისთვის ნელი ეტაპის განმავლობაში, არა მხოლოდ პუნქციისთვის.\n\n" +
      "**შემხორცების რეალური დრო.** ფურცელი: 6-8 კვირა (ყველაზე სწრაფი, რადგან ქსოვილი ცხიმიანი და კარგად შემოსისხლავებულია). ჰელიქსი, ტრაგუსი, დაითი, რუკი, კონხი: 6-12 თვე. ნესტო: 4-6 თვე. სეპტუმი: 6-8 კვირა. ინდუსტრიული: 9-12 თვე, რადგან ორი ხვრელი ერთდროულად უნდა შემხორცდეს. ეს მინიმუმებია — თუ ერთი კვირა არასწორად დაიძინე, საათი ნაწილობრივ თავიდან იწყება.\n\n" +
      "**ორი ფიზიოლოგიური ხსნარის წესი.** დღეში ორჯერ, დილით და საღამოს — სტერილური ფიზიოლოგიური ხსნარით (პირსინგისთვის გაყიდული ან 0.9% ნატრიუმის ქლორიდი, არასოდეს ძველი გზამკვლევების მარილი-წყლის ნარევი). ჩაასველე ბამბის დისკი, დაიჭირე წინა მხარეს 30 წამი, შემდეგ უკანა მხარეს 30 წამი, შემდეგ გააშრე ჰაერზე. არ ატრიალო საყურე. ბრუნვა გლეჯს ახლადგამოყვანილ ქსოვილს — ეს ერთი მთავარი მიზეზია, რის გამოც ხალხს ეგონებათ, რომ პირსინგი უარყოფს, მაშინ როცა ის უბრალოდ გაღიზიანებულია.\n\n" +
      "**რას ნიშნავს რეალურად \"შემხორცებული\".** პირსინგი შემხორცებულია, როდესაც არხის შიდა ნაწილი (არა მხოლოდ შესასვლელი) გადაიქცა გლუვ ქსოვილად, რომელიც საყურის ცვლისას აღარ სისხლავს. კანი შესაძლოა თვეების განმავლობაში ნორმალურად გამოიყურებოდეს არხის სრულ შემხორცებამდე. თუ თავდაპირველი ტიტანიდან ოქროზე გადახვედი და ორი დღის შემდეგ ისევ გამონადენი დაიწყო, ნაადრევად გადახვედი — დაუბრუნდი ტიტანს კიდევ ერთი თვით.\n\n" +
      "**რატომ ჯერ ტიტანი, შემდეგ ოქრო.** იმპლანტ-კლასის ტიტანი ერთადერთი მასალაა, რომელიც სტუდიოებმა ახალი პირსინგისთვის უნდა გამოიყენონ. ის ბიოშეთავსებადია, ნიკელის გარეშე და არ რეაგირებს დაჭრის სითხეზე, რომელიც პირველ რამდენიმე თვეში არსებობს. 14 კარატის ოქრო ჰიპოალერგენულია, მაგრამ შემხორცების სითხეში მცირედ ჟანგდება, რაც საკმარისია მგრძნობიარე ქსოვილის გასაღიზიანებლად. სრული შემხორცების შემდეგ (რეალური, არა გარეგნული) ოქრო ხდება ყოველდღიური არჩევანი.\n\n" +
      "**საფრთხის ნიშნები vs ნორმალური.** ნორმალურია 1-6 კვირაში: გამჭვირვალე ან ღია ყვითელი ქერქი შესასვლელთან, მსუბუქი სიწითლე, ხანდახან ქავილი, შეხებისას ტკივილი. არ არის ნორმალური ნებისმიერ მომენტში: სქელი მწვანე ან ყვითელი გამონადენი, შეშუპება, რომელიც მე-2 კვირის შემდეგ მცირდების ნაცვლად მატულობს, მუდმივი მფეთქავი ტკივილი ან ცხელება. ამ ნიშნების შემთხვევაში მოგვწერე ან დაგვიკავშირდი — საყურის ზომის შემცირება + მიზნობრივი გასუფთავება უმეტეს შემთხვევაში მოაგვარებს; იშვიათ შემთხვევაში გჭირდება ექიმი.\n\n" +
      "**რა ანგრევს შემხორცებას შენი შემჩნევის გარეშე.** პირსინგზე დაძინება (გამოიყენე სატენის ბალიში და სცადე ძილი ცვალო მხარეებზე). თმის პროდუქტები ირგვლივ — მშრალი შამპუნი, თმის ლაქი, leave-in კონდიციონერი — ყველა ტოვებს ნარჩენებს, რომლებიც არხში გროვდება. ყურის სამაჯური ახალ ხრტილოვან პირსინგზე. პერანგის წამოცმა ახალ მკერდის პირსინგზე. ცურვა ქლორიან აუზში ან ზღვაში (ზღვა რეალურად უარესია პირსინგებისთვის — სხეულის სითხეზე უფრო მარილიანი, ქსოვილიდან სითხეს იწოვს, ბაქტერიული დატვირთვა მაღალია). დაელოდე 4-6 კვირას ნებისმიერი ამ ქმედებამდე.\n\n" +
      "**მალსახმობი, რომელსაც არავინ გეუბნება.** ინტერნეტში ხელმისაწვდომი მოვლის რჩევების უმეტესობა იმ ხალხისთვისაა, ვინც თავი თვითონ აიჩხვლიტა Amazon-ის ქირურგიული ფოლადით. თუ ჩვენებური იმპლანტ-კლასის ტიტანით დაიწყე სათანადო სტუდიოში, შენი შემხორცება უკვე 30-40%-ით უფრო სწრაფია, ვიდრე Reddit-ზე ნაპოვნი ცუდი სცენარები. არ მიიჩნიო იაფი ლითონისთვის გათვლილი რჩევა შენს საწყის წერტილად.\n\n" +
      "სტუდიოს ჟესტი: თუ ჩვენგან შეიძინე და შემხორცება არასწორად მიდის, გადმოგვიგზავნე ფოტო WhatsApp-ით. ჩვენ პირდაპირ გეტყვით, ნორმალურია თუ არა, თუ უნდა მოხვიდე ზომის შემცირებისთვის, თუ გჭირდება ექიმი. ჩვეულებრივ შემოწმება ერთ წუთზე ნაკლებ დროს იღებს და უმეტეს ნაწილში პრობლემა აღმოჩნდება არაფერი.",
  },
];

export function getJournalPostBySlug(slug: string): JournalPost | undefined {
  return JOURNAL_POSTS.find((p) => p.slug === slug);
}

/** Sorted newest-first for the index page. */
export function getAllJournalPosts(): JournalPost[] {
  return [...JOURNAL_POSTS].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}
