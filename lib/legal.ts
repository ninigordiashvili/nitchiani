/**
 * Legal copy — Terms & Conditions, Privacy Policy, Refund/Returns Policy.
 *
 * IMPORTANT — all three are working drafts suitable for launch but **must be reviewed by a
 * Georgian lawyer** before being treated as binding. Lawyer should verify:
 *   - Terms §7 / Refund — confirm Right of Withdrawal wording matches the current statute
 *   - Terms §13 — confirm governing-law wording
 *   - Privacy lawful-basis claims and retention periods against the current GE data law
 *   - Privacy §10 (your rights) — confirm scope matches the GE Personal Data Protection Act
 *   - Whether any product category needs additional disclosures (cosmetics, hair tools, body
 *
 * The Privacy Policy and Terms §7 were rewritten on 2026-10-07 for the delivery chain the
 * shop actually runs on: orders reach a courier through a delivery platform rather than going
 * to one carrier, so Privacy §4 names every recipient and §5 explains the chain. As the
 * controller we are the one who owes the customer that disclosure, so it is made at the point
 * of collection — the notice above the checkout submit button — and not only on this page.
 *
 * One design decision a reviewer should know the reasoning for: the marketing tick at
 * checkout is separate from that notice, unticked by default and not a condition of buying,
 * because consent under the GE Personal Data Protection Act has to be specific and informed.
 * A single blanket "I agree" covering both the delivery transfers and marketing would be
 * neither. Keep the two apart if this file is rewritten. There is a local note on the
 * commercial background — see `docs/delivery-contract.local.md`, which is not committed.
 *
 * Entity details (legal name, registration ID, address) are NOT hardcoded here — they
 * come from `lib/business.ts` and are interpolated into the entity sections below.
 * Replace the placeholders in `business.ts` once, and every legal page + footer updates.
 *
 * Structured as an array of `{ headingEn, headingKa, bodyEn, bodyKa }` so the page can
 * render the right locale's sections without two `if` branches. Body paragraphs are split
 * by `\n\n` at render time.
 */

import { BUSINESS, businessAddress } from "./business";

export type LegalSection = {
  headingEn: string;
  headingKa: string;
  bodyEn: string;
  bodyKa: string;
};

export const TERMS_LAST_UPDATED = "2026-10-07";

export const TERMS_SECTIONS: LegalSection[] = [
  {
    headingEn: "1. Acceptance of these terms",
    headingKa: "1. ამ პირობების მიღება",
    bodyEn:
      "By browsing, placing an order on, or otherwise using nitchiani.shop (the \"Site\"), you confirm that you have read, understood and accepted these Terms & Conditions. If you do not accept them, please do not use the Site. We may update these terms from time to time; the version in force at the moment of your order is the one that applies to that order.",
    bodyKa:
      "nitchiani.shop-ის (\"საიტი\") გვერდის გადახედვით, შეკვეთის განთავსებით ან ნებისმიერი სხვა გამოყენებით თქვენ ადასტურებთ, რომ წაიკითხეთ, გაიგეთ და მიიღეთ წინამდებარე წესები და პირობები. თუ არ ეთანხმებით, გთხოვთ, არ ისარგებლოთ საიტით. ჩვენ შესაძლოა პერიოდულად განვაახლოთ ეს პირობები — შეკვეთის განთავსების მომენტისთვის მოქმედი ვერსია არის ის, რომელიც გავრცელდება მოცემულ შეკვეთაზე.",
  },
  {
    headingEn: "2. About us",
    headingKa: "2. ჩვენ შესახებ",
    bodyEn:
      `Nitchiani is an online shop based in Tbilisi, Georgia, selling synthetic hair for afro curls and braids, hair-care products and accessories. The Site is operated by ${BUSINESS.legalName.en}, an individual entrepreneur registered in Georgia (ID code ${BUSINESS.registrationId}), with its registered address at ${businessAddress("en")}. You can reach us at ${BUSINESS.email} or via WhatsApp using the number displayed in the site footer.`,
    bodyKa:
      `Nitchiani არის თბილისში დაფუძნებული ონლაინ მაღაზია, რომელიც ყიდის ხელოვნურ თმას აფრო ხვეულებისა და ნაწნავებისთვის, თმის მოვლის საშუალებებსა და აქსესუარებს. საიტს ოპერირებას უწევს ${BUSINESS.legalName.ka} (ინდივიდუალური მეწარმე, საიდენტიფიკაციო კოდი ${BUSINESS.registrationId}), იურიდიული მისამართი: ${businessAddress("ka")}. დაგვიკავშირდით — ${BUSINESS.email} ან WhatsApp ნომრით, რომელიც გამოქვეყნებულია საიტის ფუტერში.`,
  },
  {
    headingEn: "3. Eligibility",
    headingKa: "3. სარგებლობის უფლება",
    bodyEn:
      "You must be at least 18 years old to place an order, or place the order with the consent of a parent or legal guardian if you are under 18. By placing an order you confirm that the information you provide (name, address, phone, email) is accurate and that you are authorised to use the payment method you select.",
    bodyKa:
      "შეკვეთის განთავსების უფლება გაქვთ თუ ხართ მინიმუმ 18 წლის, ან თუ ხართ 18 წლამდე — მშობლის ან კანონიერი წარმომადგენლის თანხმობით. შეკვეთის განთავსებით თქვენ ადასტურებთ, რომ მოწოდებული ინფორმაცია (სახელი, მისამართი, ტელეფონი, ფოსტა) არის სწორი და უფლებამოსილი ხართ ისარგებლოთ მითითებული გადახდის მეთოდით.",
  },
  {
    headingEn: "4. Products, descriptions and prices",
    headingKa: "4. პროდუქტები, აღწერა და ფასები",
    bodyEn:
      "We make reasonable efforts to display product colours, materials and dimensions accurately, but slight variations may occur due to monitor calibration and the hand-finished nature of our items. Prices are shown in Georgian Lari (₾) by default; secondary currency display (e.g., USD) is for reference only and the GEL amount at checkout is the binding price. We reserve the right to correct pricing errors and to limit quantities per order. Promotional codes are subject to the conditions of each promotion (minimum spend, dates, single-use, etc.).",
    bodyKa:
      "ჩვენ მაქსიმალურად ვცდილობთ ფერების, მასალებისა და ზომების ზუსტ წარდგენას, თუმცა მცირე გადახრები შესაძლებელია მონიტორის კალიბრაციისა და ხელით დამზადებული ნივთების ბუნებიდან გამომდინარე. ფასები ნაჩვენებია ლარში (₾); დამატებითი ვალუტა (მაგ., USD) გამოიყენება მხოლოდ საცნობარო მიზნებისთვის — გადახდისას მოქმედი თანხა არის ლარში. ჩვენ ვიტოვებთ უფლებას, გავასწოროთ ფასებში დაშვებული შეცდომა და დავადგინოთ ერთ შეკვეთაში ერთეულთა მაქსიმალური რაოდენობა. პრომო-კოდები ექვემდებარება მათ მიერ დადგენილ პირობებს (მინიმალური თანხა, ვადები, ერთჯერადი გამოყენება და სხვ.).",
  },
  {
    headingEn: "5. Orders and acceptance",
    headingKa: "5. შეკვეთა და მიღება",
    bodyEn:
      "Placing an order through the Site is an offer to buy the listed items at the displayed price. We confirm receipt of your order by email or WhatsApp within a few hours. The contract is formed when we send that confirmation; until then we may, at our discretion, decline orders (e.g., out-of-stock items, suspected fraud, payment that does not settle).",
    bodyKa:
      "შეკვეთის განთავსება საიტის მეშვეობით წარმოადგენს ნივთის შესყიდვის შეთავაზებას მითითებული ფასით. ჩვენ ვადასტურებთ შეკვეთის მიღებას ფოსტით ან WhatsApp-ით რამდენიმე საათში. ხელშეკრულება ფორმდება ამ დადასტურების გაგზავნით; მანამდე ჩვენ შეგვიძლია, ჩვენი შეხედულებისამებრ, უარი ვთქვათ შეკვეთის შესრულებაზე (მაგ., მარაგი ამოწურულია, თაღლითობის ეჭვი, ანგარიშსწორების შეცდომა).",
  },
  {
    headingEn: "6. Payment",
    headingKa: "6. გადახდა",
    bodyEn:
      "We accept the payment methods displayed at checkout, which are Visa and Mastercard cards, paid through Bank of Georgia or TBC Bank. We do not accept cash on delivery. For card payments, processing is handled by the respective payment provider and is subject to their terms.",
    bodyKa:
      "ჩვენ ვიღებთ გადახდის იმ მეთოდებს, რომლებიც ნაჩვენებია გადახდის გვერდზე: Visa და Mastercard ბარათები Bank of Georgia-ს ან TBC ბანკის მეშვეობით. ნაღდი ფულით გადახდა მიწოდებისას არ ხორციელდება. ბარათით გადახდა მუშავდება შესაბამისი გადახდის სერვისის მიერ და ექვემდებარება მათ პირობებს.",
  },
  {
    headingEn: "7. Shipping and delivery",
    headingKa: "7. მიწოდება",
    bodyEn:
      `Orders are packed and dispatched from Tbilisi within 1–3 business days. Standard delivery inside Tbilisi typically arrives in 1–3 business days; deliveries to the broader region of Georgia take 3–7 business days. International orders, where available, are quoted separately. Risk of loss passes to you on delivery to the address you provided. Delivery is organised through QuickShipper, a delivery platform that dispatches your order to one of the courier companies available at the time of ordering; that courier is an independent company and its own terms apply to the carriage. Those terms differ between couriers and may set limits on parcel weight, volume and packaging, and their own rules on cancellation, return and a second delivery attempt. We will tell you which courier was assigned on request. You will receive an SMS with a tracking link once the order is dispatched. If no one is available at the address, the courier will follow their own retry policy, after which the order may be returned to us. If the delivery address or map pin you supplied is wrong or incomplete — including an address you set yourself from a link we sent you — the cost of the repeat delivery is yours, since neither we nor the platform can verify an address against reality. You can also collect your order free of charge from ${businessAddress("en")}: choose "Pick up in Tbilisi" at checkout, where the address and a contact phone number are shown. For pickup orders, risk of loss passes to you when you collect the order.`,
    bodyKa:
      `შეკვეთები იგზავნება თბილისიდან 1-3 სამუშაო დღეში. სტანდარტული მიწოდება თბილისში ხდება 1-3 სამუშაო დღეში; სხვა რეგიონებში მიწოდება — 3-7 სამუშაო დღეში. საერთაშორისო შეკვეთები (სადაც ხელმისაწვდომია) იანგარიშება ცალკე. დაკარგვის რისკი თქვენზე გადადის ნივთის ჩაბარების მომენტში მითითებულ მისამართზე. მიწოდება ორგანიზდება ქვიქშიფერის — მიწოდების პლატფორმის — მეშვეობით, რომელიც შეკვეთას გადასცემს შეკვეთის მომენტში ხელმისაწვდომ ერთ-ერთ კურიერ-კომპანიას; ეს კურიერი დამოუკიდებელი კომპანიაა და გადაზიდვაზე მისი პირობები მოქმედებს. ეს პირობები კურიერებს შორის განსხვავდება და შესაძლოა დააწესოს შეზღუდვები გზავნილის წონაზე, მოცულობასა და შეფუთვაზე, ასევე საკუთარი წესები გაუქმების, უკან დაბრუნებისა და ხელახალი მიტანის თაობაზე. მოთხოვნისას გეტყვით, რომელი კურიერი მიემაგრა შეკვეთას. შეკვეთის გაგზავნის შემდეგ მიიღებთ SMS-ს tracking ბმულით. თუ მისამართზე არავინ იქნება, კურიერი იმოქმედებს თავისი წესების შესაბამისად — შემდგომში შეკვეთა შესაძლოა დაბრუნდეს ჩვენთან. თუ თქვენ მიერ მითითებული მისამართი ან რუკის პინი არასწორი ან არასრულია — მათ შორის მაშინაც, როცა მისამართს ჩვენგან გამოგზავნილი ბმულით თავად მიუთითებთ — ხელახალი მიტანის ღირებულება თქვენ ეკისრებათ, რადგან არც ჩვენ, არც პლატფორმას არ გვაქვს მისამართის რეალობასთან შედარების შესაძლებლობა. შეკვეთის გატანა ასევე შეგიძლიათ უფასოდ, მისამართზე ${businessAddress("ka")} — გადახდისას აირჩიეთ „თვითონ გავიტან თბილისში“; მისამართი და საკონტაქტო ტელეფონი იქვეა მითითებული. ამ შემთხვევაში დაკარგვის რისკი თქვენზე გადადის შეკვეთის გატანის მომენტში.`,
  },
  {
    headingEn: "8. Right of withdrawal (24 hours)",
    headingKa: "8. უარის თქმის უფლება (24 საათი)",
    bodyEn:
      `Under the consumer protection legislation of Georgia, if you are a consumer (not buying for business purposes) you may withdraw from a distance-selling contract within 24 hours of receiving the goods, without giving any reason. To exercise this right, notify us by email at ${BUSINESS.email} or WhatsApp before the 24-hour window closes, and return the item in its original, unused, resaleable condition with all packaging. Return shipping is the customer's responsibility unless the item arrived defective. Once we receive the returned item we issue the refund using the original payment method within 14 days. Hair extensions can be returned even if the package has been opened, as long as the hair hasn't been used. Hygiene-sensitive items — opened hair-care products such as wax or leave-in conditioner, and used hair tools — are not eligible for return for hygiene reasons; this exception is allowed under the same legislation.`,
    bodyKa:
      `საქართველოს მომხმარებლის უფლებების დაცვის შესახებ კანონმდებლობის შესაბამისად, თუ თქვენ ხართ მომხმარებელი (არ ყიდულობთ კომერციული მიზნებისთვის), შეგიძლიათ უარი თქვათ დისტანციური ნასყიდობის ხელშეკრულებაზე ნივთის მიღებიდან 24 საათის განმავლობაში, მიზეზის მითითების გარეშე. ამ უფლების გამოყენებისთვის გვაცნობეთ ფოსტით ${BUSINESS.email} ან WhatsApp-ით 24-საათიანი ვადის გასვლამდე და დააბრუნეთ ნივთი თავდაპირველ, გამოუყენებელ, გასაყიდი მდგომარეობით, ყველა შესაფუთი ნივთით ერთად. დაბრუნების ღირებულება ეკისრება მომხმარებელს, გარდა იმ შემთხვევებისა, როდესაც ნივთი ჩამოვიდა დეფექტით. დაბრუნებული ნივთის მიღების შემდეგ თანხას დაგიბრუნებთ თავდაპირველი გადახდის მეთოდით 14 დღის განმავლობაში. ხელოვნური თმის დაბრუნება შესაძლებელია შეფუთვის გახსნის შემდეგაც, თუ თმა არ არის გამოყენებული. ჰიგიენისადმი მგრძნობიარე ნივთები — გახსნილი თმის მოვლის საშუალებები, მაგალითად ცვილი ან ლივ-ინ კონდიციონერი, და გამოყენებული ხელსაწყოები — არ ექვემდებარება დაბრუნებას ჰიგიენური მიზეზებიდან გამომდინარე; ეს გამონაკლისი ნებადართულია იმავე კანონმდებლობით.`,
  },
  {
    headingEn: "9. Defective or incorrect items",
    headingKa: "9. დეფექტიანი ან არასწორი ნივთები",
    bodyEn:
      "If the item arrives damaged, defective or different from what you ordered, contact us within 7 days of delivery with photos. We will arrange a replacement at our cost or a full refund (including return shipping) at your choice. Your statutory rights as a consumer in Georgia are not affected by this policy.",
    bodyKa:
      "თუ ნივთი ჩამოვიდა დაზიანებული, დეფექტიანი ან არ ემთხვევა შეკვეთას, დაგვიკავშირდით ჩაბარებიდან 7 დღის განმავლობაში ფოტოებთან ერთად. ჩვენ მოვაგვარებთ ჩანაცვლებას ჩვენი ხარჯით ან სრულ ანაზღაურებას (დაბრუნების ხარჯის ჩათვლით) თქვენი არჩევანის შესაბამისად. ეს პოლიტიკა არ ცვლის თქვენს კანონით გათვალისწინებულ უფლებებს მომხმარებლის სტატუსით საქართველოში.",
  },
  {
    headingEn: "10. Intellectual property",
    headingKa: "10. ინტელექტუალური საკუთრება",
    bodyEn:
      "All content on the Site — including the Nitchiani name and logo, product photography, copy, illustrations and editorial material — is owned by us or used under licence and is protected by Georgian and international intellectual-property law. You may not reproduce, redistribute or use any of it for commercial purposes without our prior written consent. Personal, non-commercial use (sharing a product page with a friend, screenshots for personal reference, etc.) is welcome.",
    bodyKa:
      "საიტზე განთავსებული ყველა შინაარსი — მათ შორის Nitchiani-ის სახელი და ლოგო, პროდუქტის ფოტოები, ტექსტი, ილუსტრაციები და სარედაქციო მასალა — წარმოადგენს ჩვენს საკუთრებას ან გამოიყენება ლიცენზიის საფუძველზე და დაცულია საქართველოს და საერთაშორისო ინტელექტუალური საკუთრების კანონმდებლობით. მათი გადაბეჭდვა, გავრცელება ან კომერციული მიზნებისთვის გამოყენება ჩვენი წინასწარი წერილობითი ნებართვის გარეშე აკრძალულია. პირადი, არაკომერციული გამოყენება (პროდუქტის გვერდის გაზიარება მეგობარს, სკრინშოტი პირადი მიზნით) ნებადართულია.",
  },
  {
    headingEn: "11. Acceptable use",
    headingKa: "11. დასაშვები გამოყენება",
    bodyEn:
      "You agree not to use the Site to: place fraudulent orders or use unauthorised payment methods; submit false personal information; attempt to interfere with the Site's operation or security; or use any automated means (scrapers, bots) to access or copy material from the Site without our prior written permission. We may suspend access for any user who breaches these terms.",
    bodyKa:
      "თქვენ თანხმდებით, რომ არ გამოიყენებთ საიტს: თაღლითური შეკვეთების განთავსების ან არაუფლებამოსილი გადახდის მეთოდის გამოყენების მიზნით; ცრუ პერსონალური ინფორმაციის წარდგენით; საიტის მუშაობის ან უსაფრთხოების შეფერხების მცდელობით; ან რაიმე ავტომატური საშუალებებით (სკრეიპერი, ბოტი) საიტიდან მასალის წვდომის ან კოპირების მიზნით ჩვენი წინასწარი წერილობითი ნებართვის გარეშე. ჩვენ შეგვიძლია შევაჩეროთ წვდომა იმ მომხმარებლისთვის, ვინც დაარღვევს ამ პირობებს.",
  },
  {
    headingEn: "12. Limitation of liability",
    headingKa: "12. პასუხისმგებლობის შეზღუდვა",
    bodyEn:
      "To the extent permitted by Georgian law, our total liability for any claim arising out of or relating to an order or your use of the Site is limited to the amount you paid for the order in question. We are not responsible for indirect, incidental or consequential losses (e.g., loss of time, missed deadlines, third-party costs). Nothing in this clause limits liability for death, personal injury caused by negligence, fraud or any other matter that cannot lawfully be excluded.",
    bodyKa:
      "საქართველოს კანონმდებლობით დაშვებული ფარგლების შესაბამისად, ჩვენი მთლიანი პასუხისმგებლობა შეკვეთასთან ან საიტის გამოყენებასთან დაკავშირებული ნებისმიერი მოთხოვნისთვის შემოიფარგლება მოცემული შეკვეთისთვის გადახდილი თანხით. ჩვენ არ ვართ პასუხისმგებელი ირიბი, შემთხვევითი ან თანმდევი ზიანებისთვის (მაგ., დაკარგული დრო, გაცდენილი ვადები, მესამე მხარის ხარჯები). ეს დებულება არ ზღუდავს პასუხისმგებლობას სიკვდილზე, გაუფრთხილებლობით გამოწვეულ ჯანმრთელობის ზიანზე, თაღლითობაზე ან სხვა საკითხებზე, რომელთა გამორიცხვაც კანონით აკრძალულია.",
  },
  {
    headingEn: "13. Governing law and jurisdiction",
    headingKa: "13. გამოყენებადი სამართალი და იურისდიქცია",
    bodyEn:
      "These terms are governed by the laws of Georgia. Any dispute that we cannot resolve in good faith through direct communication will be referred to the courts of Tbilisi, Georgia. If you are a consumer resident outside Georgia, your statutory rights under your home country's consumer law are not affected.",
    bodyKa:
      "ეს პირობები რეგულირდება საქართველოს კანონმდებლობით. ნებისმიერი დავა, რომელსაც ვერ მოვაგვარებთ პირდაპირი კომუნიკაციით კეთილსინდისიერი მცდელობით, განიხილება თბილისის სასამართლოში. თუ ხართ მომხმარებელი საქართველოს ფარგლებს გარეთ, თქვენი ქვეყნის მომხმარებლის უფლებების კანონით გათვალისწინებული უფლებები არ იცვლება.",
  },
  {
    headingEn: "14. Contact",
    headingKa: "14. კონტაქტი",
    bodyEn:
      `Questions about these terms or about your order are welcome at ${BUSINESS.email} or via WhatsApp using the number in the footer. We usually respond within a few hours during working days.`,
    bodyKa:
      `კითხვები ამ პირობებთან ან თქვენს შეკვეთასთან დაკავშირებით — ${BUSINESS.email} ან WhatsApp ფუტერში მითითებული ნომრით. ჩვეულებრივ ვპასუხობთ რამდენიმე საათში სამუშაო დღეების განმავლობაში.`,
  },
];

/**
 * Last updated bumps whenever the recipient chain changes — adding a processor is a material
 * change under section 12, so the date is what tells a returning customer to re-read it.
 */
export const PRIVACY_LAST_UPDATED = "2026-10-07";

export const PRIVACY_SECTIONS: LegalSection[] = [
  {
    headingEn: "1. Who we are",
    headingKa: "1. ვინ ვართ",
    bodyEn:
      `This Privacy Policy explains how Nitchiani — operated by ${BUSINESS.legalName.en}, an individual entrepreneur registered in Georgia (ID code ${BUSINESS.registrationId}), with its registered address at ${businessAddress("en")} — collects, uses and protects the personal data you provide when you use nitchiani.shop (the "Site"). We are the data controller for the data described below. Delivery of your order involves several named companies; section 5 sets out exactly who receives what. For questions reach us at ${BUSINESS.email}.`,
    bodyKa:
      `ეს კონფიდენციალურობის პოლიტიკა განმარტავს, როგორ აგროვებს, იყენებს და იცავს Nitchiani იმ პერსონალურ მონაცემებს, რომელსაც გვაწვდი nitchiani.shop-ის ("საიტი") გამოყენებისას. საიტის ოპერატორია ${BUSINESS.legalName.ka} (ინდივიდუალური მეწარმე, საიდენტიფიკაციო კოდი ${BUSINESS.registrationId}, მისამართი: ${businessAddress("ka")}). ჩვენ ვართ ქვემოთ აღწერილი მონაცემების მაკონტროლებელი. შენი შეკვეთის მიწოდებაში რამდენიმე დასახელებული კომპანია მონაწილეობს — მე-5 პუნქტი ზუსტად აღწერს, ვინ რას იღებს. შეკითხვებზე — ${BUSINESS.email}.`,
  },
  {
    headingEn: "2. What data we collect",
    headingKa: "2. რა მონაცემებს ვაგროვებთ",
    bodyEn:
      "We collect only what we need to take your order, ship it, support you afterwards and run the Site. This includes: contact details you give us (name, email, phone, shipping address); the precise coordinates of the delivery point when you place a pin on the checkout map, or when you set the address yourself from a link we send you; order details (items, amounts, payment method, order history); communications you send us (WhatsApp messages, emails, live-chat messages); technical data automatically logged when you visit (IP address, device type, browser, pages viewed); and optional marketing data if you consent to marketing (email, phone and language preference). We do not collect special-category data (health, religion, biometrics) and we do not knowingly collect data from children under 16.",
    bodyKa:
      "ვაგროვებთ მხოლოდ იმას, რაც გვჭირდება შენი შეკვეთის მიღების, გაგზავნის, შემდგომი მხარდაჭერისა და საიტის გასაშვებად. ეს მოიცავს: საკონტაქტო მონაცემებს, რომელსაც გვაწვდი (სახელი, ფოსტა, ტელეფონი, მისამართი); მიწოდების წერტილის ზუსტ კოორდინატებს, როდესაც გადახდის გვერდის რუკაზე პინს დასვამ, ან როდესაც მისამართს ჩვენგან გამოგზავნილი ბმულით თავად მიუთითებ; შეკვეთის დეტალებს (ნივთები, თანხები, გადახდის მეთოდი, შეკვეთის ისტორია); შენ მიერ გამოგზავნილ კომუნიკაციას (WhatsApp, ფოსტა, ონლაინ ჩატი); ვიზიტისას ავტომატურად ჩაწერილ ტექნიკურ მონაცემებს (IP, მოწყობილობის ტიპი, ბრაუზერი, ნანახი გვერდები); და მარკეტინგზე თანხმობის შემთხვევაში — ფოსტას, ტელეფონს და ენის პრეფერენციას. არ ვაგროვებთ სპეციალური კატეგორიის მონაცემებს (ჯანმრთელობა, რელიგია, ბიომეტრია) და შეგნებულად არ ვაგროვებთ 16 წლამდე ბავშვების მონაცემებს.",
  },
  {
    headingEn: "3. Why we use it and on what lawful basis",
    headingKa: "3. რატომ ვიყენებთ და რა სამართლებრივი საფუძვლით",
    bodyEn:
      "Performance of contract — to take, fulfil and deliver your order, to pass the delivery address and phone to the delivery platform and the courier that carries it, to send you the delivery status messages described in section 5, and to handle returns and customer support. Legitimate interest — to protect the Site against fraud and abuse, to analyse aggregated traffic patterns so we can improve the experience, and to follow up on abandoned carts in a non-intrusive way. Consent — to send marketing messages when you have ticked the marketing box at checkout or signed up in the footer, to let our delivery partner send you its own marketing, and to use non-essential cookies. Each of those is a separate, optional tick and none of them is a condition of buying; you can withdraw any of them at any time. Legal obligation — to keep records the tax and consumer-protection authorities of Georgia require us to keep.",
    bodyKa:
      "ხელშეკრულების შესრულება — შენი შეკვეთის მიღება, შესრულება და მიწოდება, მიწოდების მისამართისა და ტელეფონის გადაცემა მიწოდების პლატფორმასა და მზიდ კურიერს, მე-5 პუნქტში აღწერილი სტატუსის შეტყობინებების გაგზავნა, დაბრუნებების და მხარდაჭერის მართვა. ლეგიტიმური ინტერესი — საიტის დაცვა თაღლითობისგან, აგრეგირებული ტრაფიკის ანალიზი გამოცდილების გასაუმჯობესებლად და მიტოვებული კალათების არაინტრუზიული შეხსენებები. თანხმობა — მარკეტინგული შეტყობინებების გასაგზავნად, როდესაც გადახდის გვერდზე ან ფუტერში შესაბამის ველს მონიშნავ; იმისთვის, რომ ჩვენმა მიწოდების პარტნიორმა შენ საკუთარი მარკეტინგული შეთავაზება გამოგიგზავნოს; და არააუცილებელი ქუქი-ფაილების გამოყენებისთვის. თითოეული ეს თანხმობა ცალკეა, არჩევითია და არ არის შეკვეთის განთავსების პირობა; ნებისმიერ დროს შეგიძლია გააუქმო. სამართლებრივი ვალდებულება — საქართველოს საგადასახადო და მომხმარებლის უფლებების ორგანოების მიერ მოთხოვნილი ჩანაწერების შენახვა.",
  },
  {
    headingEn: "4. Who we share it with",
    headingKa: "4. ვის ვუზიარებთ",
    bodyEn:
      `We never sell your data. We share only what each recipient needs, and these are the recipients by name: EchoDesk (LLC EchoDesk, api.echodesk.ge) — the commerce and order-management system behind the Site, and the live chat; it holds your order record in full. LLC QuickShipper (ID code 405547877, quickshipper.app) — the delivery platform that takes your delivery address, coordinates, name and phone and dispatches the order to a courier. The courier company that actually carries your order — chosen per order from the providers available in the platform at that moment (Wolt, Glovo, Georgian Post, Go Delivery and others; the list changes without notice), each of which receives your name, phone, address and coordinates, and each of which has its own terms and its own privacy notice. Google (Maps and Places APIs) — the checkout address picker sends what you type in the address field and the pin you drop, as coordinates, to Google. Bank of Georgia and TBC Bank — to authorise and settle card payments. Resend — order confirmation emails and, with your consent, marketing emails. An SMS gateway contracted by QuickShipper — the delivery messages in section 5. Netlify — hosting and request logs. Google Analytics — only if you have consented to non-essential cookies. The tax authority of Georgia — when legally required. Each recipient has its own published privacy notice; links available on request at ${BUSINESS.email}.`,
    bodyKa:
      `შენს მონაცემებს არასოდეს ვყიდით. ვუზიარებთ მხოლოდ იმას, რაც თითოეულ მიმღებს სჭირდება — და ეს მიმღებები სახელდებით ასეთია: EchoDesk (შპს EchoDesk, api.echodesk.ge) — სავაჭრო და შეკვეთების მართვის სისტემა, რომელზეც საიტი დგას, ასევე ონლაინ ჩატი; შენი შეკვეთის ჩანაწერი სრულად მასთან ინახება. შპს „ქვიქშიფერი“ (ს/ნ 405547877, quickshipper.app) — მიწოდების პლატფორმა, რომელიც იღებს შენს მიწოდების მისამართს, კოორდინატებს, სახელსა და ტელეფონს და შეკვეთას კურიერს გადასცემს. კურიერ-კომპანია, რომელიც უშუალოდ ეზიდება შეკვეთას — ირჩევა ყოველ შეკვეთაზე იმ პროვაიდერებიდან, რომლებიც პლატფორმაში ხელმისაწვდომია (Wolt, Glovo, საქართველოს ფოსტა, Go Delivery და სხვები; სია იცვლება გაფრთხილების გარეშე); თითოეული იღებს შენს სახელს, ტელეფონს, მისამართსა და კოორდინატებს, და თითოეულს აქვს თავისი პირობები და თავისი კონფიდენციალურობის პოლიტიკა. Google (Maps და Places API) — გადახდის გვერდის მისამართის ამრჩევი Google-ს უგზავნის იმას, რასაც მისამართის ველში წერ, და დასმულ პინს კოორდინატების სახით. საქართველოს ბანკი და თიბისი ბანკი — ბარათით გადახდის გასატარებლად. Resend — შეკვეთის დადასტურების წერილები და, თანხმობის შემთხვევაში, მარკეტინგული წერილები. ქვიქშიფერის მიერ დაკონტრაქტებული SMS-გეითვეი — მე-5 პუნქტში აღწერილი შეტყობინებები. Netlify — ჰოსტინგი და მოთხოვნების ლოგები. Google Analytics — მხოლოდ თუ არააუცილებელ ქუქი-ფაილებს დაეთანხმე. საქართველოს საგადასახადო ორგანო — კანონით მოთხოვნისას. თითოეულ მიმღებს აქვს თავისი გამოქვეყნებული პოლიტიკა; ბმულები ხელმისაწვდომია მოთხოვნით — ${BUSINESS.email}.`,
  },
  {
    headingEn: "5. Delivery, SMS and order tracking",
    headingKa: "5. მიწოდება, SMS და შეკვეთის თვალყურის დევნება",
    bodyEn:
      "Delivery is organised through QuickShipper, which is a platform rather than a courier: it takes the order from us, prices it across the courier companies available at that moment, and hands it to the one selected. Three things follow from that, and you should know about all three before you order. First, you will receive an SMS on the number you gave us containing a link to a tracking page, so you can follow the order in real time; that message is sent through QuickShipper's SMS gateway and may arrive under our name or under QuickShipper's. Second, if we ask you to set the delivery point yourself, you will receive an SMS with a link to a map where you place the pin — the address and coordinates you enter there are yours, and neither we nor QuickShipper can verify that they are correct, so a delivery sent to a wrong pin is redelivered at your cost. Third, the tracking page is operated by QuickShipper and may show advertising alongside your order status; that advertising is served by QuickShipper, not by us, and we do not pass your order contents to any advertiser. The courier that carries your order is an independent company with its own terms, its own handling and return policy and its own privacy notice; we are responsible for what we send them, and they are responsible for how they carry it.",
    bodyKa:
      "მიწოდება ორგანიზდება ქვიქშიფერის მეშვეობით, რომელიც კურიერი არ არის, არამედ პლატფორმაა: იღებს ჩვენგან შეკვეთას, აფასებს იმ კურიერ-კომპანიებს შორის, რომლებიც იმ მომენტში ხელმისაწვდომია, და გადასცემს არჩეულს. აქედან სამი რამ გამომდინარეობს და სამივე უნდა იცოდე შეკვეთამდე. პირველი — შენ მიერ მითითებულ ნომერზე მიიღებ SMS-ს tracking გვერდის ბმულით, რომ შეკვეთას რეალურ დროში მიადევნო თვალი; ეს შეტყობინება იგზავნება ქვიქშიფერის SMS-გეითვეით და შესაძლოა მოვიდეს ჩვენი ან ქვიქშიფერის სახელით. მეორე — თუ მიწოდების წერტილის თავად მითითებას გთხოვთ, მიიღებ SMS-ს რუკის ბმულით, სადაც პინს დასვამ; იქ შეყვანილი მისამართი და კოორდინატები შენია და არც ჩვენ, არც ქვიქშიფერს არ გვაქვს მათი სისწორის გადამოწმების შესაძლებლობა, ამიტომ არასწორ პინზე გაგზავნილი შეკვეთის ხელახალი მიტანა შენი ხარჯით ხდება. მესამე — tracking გვერდს ქვიქშიფერი მართავს და შენი შეკვეთის სტატუსის გვერდზე შესაძლოა რეკლამა გამოჩნდეს; ამ რეკლამას ქვიქშიფერი ანთავსებს, არა ჩვენ, და შენი შეკვეთის შიგთავსს არცერთ რეკლამის განმთავსებელს არ გადავცემთ. კურიერი, რომელიც შეკვეთას ეზიდება, დამოუკიდებელი კომპანიაა საკუთარი პირობებით, გადაზიდვისა და დაბრუნების საკუთარი პოლიტიკით და საკუთარი კონფიდენციალურობის პოლიტიკით; ჩვენ პასუხს ვაგებთ იმაზე, რას გადავცემთ, ისინი — იმაზე, როგორ ეზიდებიან.",
  },
  {
    headingEn: "6. International transfers",
    headingKa: "6. საერთაშორისო გადაცემები",
    bodyEn:
      "Some of our processors are based outside Georgia — primarily in the EU and the United States (Google, Resend, Netlify). Where data leaves Georgia, we rely on standard contractual clauses or adequacy decisions where available, and we only use providers that publish equivalent or stronger data-protection practices than Georgian law requires. EchoDesk, QuickShipper and the courier providers operate in Georgia.",
    bodyKa:
      "ჩვენი ზოგიერთი პროცესორი დაფუძნებულია საქართველოს გარეთ — უპირატესად ევროკავშირში და აშშ-ში (Google, Resend, Netlify). სადაც მონაცემები გადის საქართველოდან, ვეყრდნობით სტანდარტულ სახელშეკრულებო პუნქტებს ან მონაცემთა დაცვის ადეკვატურობის გადაწყვეტილებებს, სადაც ხელმისაწვდომია, და ვიყენებთ მხოლოდ ისეთ პროცესორებს, რომლებიც ქართულ კანონმდებლობასთან თანაბარ ან უფრო ძლიერ პრაქტიკას ინარჩუნებენ. EchoDesk, ქვიქშიფერი და კურიერი პროვაიდერები საქართველოში ოპერირებენ.",
  },
  {
    headingEn: "7. How long we keep it",
    headingKa: "7. რამდენ ხანს ვინახავთ",
    bodyEn:
      "Order records: 7 years after the order date (Georgian tax record-keeping requirement). Marketing consents and the evidence of them: for as long as the consent stands, plus 3 years after you withdraw it, so we can show it was given. Marketing contact lists: until you unsubscribe or 24 months of inactivity, whichever is sooner. Customer-support correspondence: 24 months after the last message. Technical/server logs: 90 days. Anonymised analytics: indefinitely. EchoDesk, QuickShipper and the courier that carried your order keep their own copies of the delivery data under their own retention rules, which we do not control; where you ask us to delete data, we forward the request to them as described in section 10. After a retention period ends, data on our side is deleted or anonymised.",
    bodyKa:
      "შეკვეთის ჩანაწერები: შეკვეთის თარიღიდან 7 წელი (საქართველოს საგადასახადო ვალდებულება). მარკეტინგული თანხმობები და მათი დადასტურება: თანხმობის მოქმედების მანძილზე და გაუქმებიდან კიდევ 3 წელი, რომ შევძლოთ მისი არსებობის ჩვენება. მარკეტინგული საკონტაქტო სიები: გამოწერის გაუქმებამდე ან 24 თვის უმოქმედობამდე — რომელიც ადრე დადგება. მხარდაჭერის მიმოწერა: უკანასკნელი წერილიდან 24 თვე. ტექნიკური/სერვერული ლოგები: 90 დღე. ანონიმური ანალიტიკა: უსასრულოდ. EchoDesk, ქვიქშიფერი და შეკვეთის მზიდი კურიერი მიწოდების მონაცემების საკუთარ ასლებს ინახავენ საკუთარი წესებით, რასაც ჩვენ არ ვაკონტროლებთ; თუ წაშლას მოითხოვ, მოთხოვნას მათ გადავუგზავნით მე-10 პუნქტის შესაბამისად. შენახვის ვადის გასვლის შემდეგ ჩვენს მხარეს მონაცემები იშლება ან ანონიმდება.",
  },
  {
    headingEn: "8. Cookies and similar technologies",
    headingKa: "8. ქუქი-ფაილები და მსგავსი ტექნოლოგიები",
    bodyEn:
      "We use a small number of strictly necessary cookies to make the cart, wishlist, language and currency settings remember themselves across pages — these don't need consent. Anything optional (analytics, marketing pixels) only loads after you've given consent through our cookie banner. The Google Maps address picker at checkout loads from Google and sets Google's own cookies when you use it; it loads because it is needed to price and dispatch a delivery, and if you prefer not to use it you can type the address instead. You can change your cookie preference at any time via the link in the footer.",
    bodyKa:
      "ვიყენებთ მცირე რაოდენობით აუცილებელ ქუქი-ფაილებს, რათა კალათამ, სასურველთა სიამ, ენისა და ვალუტის პარამეტრებმა გვერდებს შორის დაიმახსოვრონ თავი — ისინი თანხმობას არ მოითხოვს. სურვილისამებრი (ანალიტიკა, მარკეტინგული პიქსელები) იტვირთება მხოლოდ მას შემდეგ, რაც დაეთანხმები ქუქი-ფაილების ბანერის მეშვეობით. გადახდის გვერდზე Google Maps-ის მისამართის ამრჩევი Google-იდან იტვირთება და გამოყენებისას Google-ის საკუთარ ქუქი-ფაილებს აყენებს; ის იტვირთება იმიტომ, რომ მიწოდების დაფასება და გაგზავნა ამას მოითხოვს — თუ არ გსურს მისი გამოყენება, მისამართი ხელით შეგიძლია აკრიფო. ქუქი-ფაილების პრეფერენცია ნებისმიერ დროს შეგიძლია შეცვალო ფუტერში მითითებული ბმულით.",
  },
  {
    headingEn: "9. Security",
    headingKa: "9. უსაფრთხოება",
    bodyEn:
      "Data in transit is encrypted with TLS. Card details are never touched by our servers — they're entered directly into Bank of Georgia / TBC Bank's hosted payment forms. Access to the order system is restricted to a small number of named operators and is audit-logged. If a breach occurs that affects you, we'll notify you and the supervisory authority within the timeframe the law requires; where the breach happened at EchoDesk, QuickShipper or a courier rather than with us, we will tell you that and tell you which one.",
    bodyKa:
      "გადაცემული მონაცემები დაშიფრულია TLS-ით. ბარათის დეტალები არასოდეს გადის ჩვენი სერვერებიდან — შეგყავ პირდაპირ საქართველოს ბანკის / თიბისის გადახდის ფორმაში. შეკვეთების სისტემაზე წვდომა შეზღუდულია ცოტა რაოდენობის სახელობით ოპერატორებზე და აქვს აუდიტ-ჟურნალი. თუ მონაცემთა გაჟონვა მოხდება, რომელიც შენ შეგეხება, შეგატყობინებთ შენ და ზედამხედველ ორგანოს კანონით განსაზღვრულ ვადებში; თუ გაჟონვა მოხდა EchoDesk-ის, ქვიქშიფერის ან კურიერის მხარეს და არა ჩვენთან, ამასაც გეტყვით და იმასაც, რომელთან.",
  },
  {
    headingEn: "10. Your rights",
    headingKa: "10. შენი უფლებები",
    bodyEn:
      `Under the Georgian Personal Data Protection Act you have the right to: access the data we hold about you; correct anything that's inaccurate; ask us to delete data we no longer need; restrict or object to processing for marketing or legitimate-interest purposes; receive your data in a portable format; withdraw any consent you've given (without affecting prior processing); and lodge a complaint with the Georgian Personal Data Protection Service. To exercise any of these, email ${BUSINESS.email} — we respond within 30 days, usually much sooner. Where the data sits with EchoDesk, QuickShipper or a courier rather than with us, we forward your request to them, tell you the date we forwarded it and pass on their answer; we cannot delete records from their systems ourselves. Withdrawing consent to our delivery partner's marketing is handled the same way — tell us and we pass it on, or use the unsubscribe details in the message itself.`,
    bodyKa:
      `საქართველოს პერსონალურ მონაცემთა დაცვის შესახებ კანონის შესაბამისად, შენ გაქვს უფლება: წვდომა შენი მონაცემებზე; გაასწორო არასწორი მონაცემები; მოითხოვო წაშლა, თუ მონაცემები აღარ გვჭირდება; შეზღუდო ან გააპროტესტო დამუშავება მარკეტინგის ან ლეგიტიმური ინტერესისთვის; მიიღო შენი მონაცემები გადატანად ფორმატში; გააუქმო შენ მიერ მოცემული თანხმობა (წინა დამუშავებაზე გავლენის გარეშე); და შეიტანო საჩივარი საქართველოს პერსონალურ მონაცემთა დაცვის სამსახურში. რომელიმე უფლების გამოსაყენებლად — ${BUSINESS.email}; ვპასუხობთ 30 დღეში, ჩვეულებრივ ბევრად ადრე. თუ მონაცემები EchoDesk-თან, ქვიქშიფერთან ან კურიერთან ინახება და არა ჩვენთან, მოთხოვნას მათ გადავუგზავნით, გეტყვით გადაგზავნის თარიღს და მათ პასუხს გადმოგცემთ; მათი სისტემებიდან ჩანაწერების წაშლა ჩვენ თვითონ ვერ შეგვიძლია. მიწოდების პარტნიორის მარკეტინგზე თანხმობის გაუქმებაც ასევე ხდება — გვითხარი და გადავცემთ, ან გამოიყენე თავად შეტყობინებაში მითითებული გამოწერის გაუქმების დეტალები.`,
  },
  {
    headingEn: "11. Children",
    headingKa: "11. ბავშვები",
    bodyEn:
      "The Site is intended for adults. We don't knowingly collect personal data from anyone under 16. If you believe we've collected data from a minor, contact us and we'll delete it.",
    bodyKa:
      "საიტი განკუთვნილია მოზრდილებისთვის. შეგნებულად არ ვაგროვებთ პერსონალურ მონაცემებს 16 წლამდე პირებისგან. თუ თვლი, რომ ჩვენ მოვაგროვეთ მონაცემები არასრულწლოვანისგან, დაგვიკავშირდი — წავშლით.",
  },
  {
    headingEn: "12. Changes to this policy",
    headingKa: "12. ცვლილებები ამ პოლიტიკაში",
    bodyEn:
      "If we change this policy in a way that materially affects you — for example we add a new processor, or the delivery chain in section 5 changes — we'll notify you by email if we hold your address for marketing, or by a notice on the Site. Less material updates will simply replace the previous version with the new \"Last updated\" date. The courier providers reachable through QuickShipper change without notice to us; section 4 names the ones available when this version was published and is updated as they change.",
    bodyKa:
      "თუ ამ პოლიტიკას შევცვლით ისე, რომ ეს არსებითად შეგეხება — მაგალითად, დავამატებთ ახალ პროცესორს, ან შეიცვლება მე-5 პუნქტში აღწერილი მიწოდების ჯაჭვი — შეგატყობინებთ ფოსტით, თუ შენი მისამართი მარკეტინგისთვის გვაქვს, ან საიტზე გამოვაქვეყნებთ შეტყობინებას. ნაკლებად არსებითი განახლებები უბრალოდ ჩაანაცვლებენ წინა ვერსიას ახალი \"ბოლო განახლების\" თარიღით. ქვიქშიფერის მეშვეობით ხელმისაწვდომი კურიერი პროვაიდერები ჩვენთვის გაფრთხილების გარეშე იცვლება; მე-4 პუნქტი ასახელებს იმათ, რომლებიც ამ ვერსიის გამოქვეყნებისას ხელმისაწვდომი იყო, და ახლდება მათი ცვლილებისას.",
  },
  {
    headingEn: "13. Contact",
    headingKa: "13. კონტაქტი",
    bodyEn:
      `Privacy questions and rights requests are welcome at ${BUSINESS.email} or via WhatsApp using the number in the footer. We answer most within a few hours during working days; rights requests get a written reply within 30 days.`,
    bodyKa:
      `კონფიდენციალურობასთან დაკავშირებული შეკითხვები და უფლებების მოთხოვნები — ${BUSINESS.email} ან WhatsApp ფუტერში მითითებული ნომრით. უმეტესობას ვპასუხობთ რამდენიმე საათში სამუშაო დღეებში; უფლებების მოთხოვნებზე — წერილობით 30 დღის განმავლობაში.`,
  },
];

export const REFUND_LAST_UPDATED = "2026-05-20";

export const REFUND_SECTIONS: LegalSection[] = [
  {
    headingEn: "1. 24-hour right of withdrawal",
    headingKa: "1. 24-საათიანი უარის თქმის უფლება",
    bodyEn:
      `Under the consumer protection legislation of Georgia, if you bought from us as a consumer (not for business purposes) you may return your order within 24 hours of receiving it, without giving any reason. This window starts on the day the last item in your order is delivered. To exercise this right, notify us by email at ${BUSINESS.email} or WhatsApp before the 24 hours are up — sending the package back without notifying us first slows things down on both sides.`,
    bodyKa:
      `საქართველოს მომხმარებლის უფლებების შესახებ კანონმდებლობის შესაბამისად, თუ მომხმარებლის სტატუსით შეიძინე ჩვენგან (არა კომერციული მიზნით), შეგიძლია დააბრუნო შეკვეთა მისი მიღებიდან 24 საათის განმავლობაში, მიზეზის მითითების გარეშე. ვადა იწყება შენი შეკვეთის უკანასკნელი ნივთის ჩაბარების დღიდან. ამ უფლების გამოყენებისთვის გვაცნობე ფოსტით ${BUSINESS.email} ან WhatsApp-ით 24 საათის გასვლამდე — გაცნობების გარეშე გამოგზავნა ანელებს პროცესს ორივე მხრიდან.`,
  },
  {
    headingEn: "2. Items that can't be returned",
    headingKa: "2. ნივთები, რომლებიც ვერ დაბრუნდება",
    bodyEn:
      "For hygiene reasons, the following are excluded from the 24-hour withdrawal right once they've been opened or used: opened hair-care products (wax, leave-in conditioners, oils, gels); used hair tools (combs, picks, brushes); and any custom or made-to-order piece. Unopened hair-care products remain returnable. Hair extensions are not on this list: they can be returned even if the package has been opened, as long as the hair hasn't been used. This exception is allowed under the same Georgian consumer-protection statute that gives you the right.",
    bodyKa:
      "ჰიგიენური მიზეზებიდან გამომდინარე, შემდეგი ნივთები არ ექვემდებარება 24-საათიან დაბრუნებას, თუ გახსნილია ან გამოყენებულია: გახსნილი თმის მოვლის საშუალებები (ცვილი, ლივ-ინ კონდიციონერები, ზეთები, გელები); გამოყენებული ხელსაწყოები (სავარცხლები, პიკები, ფუნჯები); ნებისმიერი ინდივიდუალურად დამზადებული ნივთი. გაუხსნელი თმის მოვლის საშუალებები კვლავ ექვემდებარება დაბრუნებას. ხელოვნური თმა ამ სიაში არ შედის: მისი დაბრუნება შესაძლებელია შეფუთვის გახსნის შემდეგაც, თუ თმა არ არის გამოყენებული. ეს გამონაკლისი ნებადართულია იმავე ქართული კანონმდებლობით, რომელიც დაბრუნების უფლებას გვაძლევს.",
  },
  {
    headingEn: "3. Condition we need it in",
    headingKa: "3. რა მდგომარეობით უნდა დაბრუნდეს",
    bodyEn:
      "Items should come back unused, in their original packaging, with all tags, bags and protective wrapping intact. Hair extensions, bonnets, durags and accessories may be unwrapped and inspected (the same way you'd inspect a piece in a shop) but not worn or used — for hair, that means not braided, cut, washed or styled. If the item arrives back with visible signs of use, we may offer a partial refund proportional to the loss of value.",
    bodyKa:
      "ნივთები უნდა დაბრუნდეს გამოუყენებლად, თავდაპირველი შეფუთვით, ყველა ეტიკეტით, ჩანთით და დამცავი ბაფთით. ხელოვნური თმა, ბონეტები, დურაგები და აქსესუარები შეგიძლია გახსნა და დაათვალიერო (ისე, როგორც მაღაზიაში დაათვალიერებდი) — მაგრამ არ ატარო და არ გამოიყენო; თმის შემთხვევაში ეს ნიშნავს, რომ არ დაგიწნავს, არ შეგიჭრია, არ დაგიბანია და არ დაგივარცხნია. თუ ნივთი დაბრუნდება ხმარების აშკარა ნიშნებით, შესაძლოა შემოგთავაზოთ ნაწილობრივი ანაზღაურება ღირებულების დაკარგვის პროპორციულად.",
  },
  {
    headingEn: "4. How to start a return",
    headingKa: "4. როგორ დავიწყო დაბრუნება",
    bodyEn:
      `Email ${BUSINESS.email} or WhatsApp us with your order number and which items you want to return. We'll send back a confirmation and the return address within a few hours during working days. Once you've shipped the package, send us the courier tracking number so we can keep an eye on it.`,
    bodyKa:
      `მოგვწერე ${BUSINESS.email}-ზე ან WhatsApp-ით შეკვეთის ნომრით და მიუთითე რომელი ნივთები გსურს დააბრუნო. რამდენიმე საათში სამუშაო დღეებში მიიღებ დადასტურებას და დაბრუნების მისამართს. გაგზავნის შემდეგ გაგვიგზავნე ტრეკინგის ნომერი, რომ შევძლოთ თვალყურის დევნება.`,
  },
  {
    headingEn: "5. Return shipping",
    headingKa: "5. დაბრუნების მიწოდება",
    bodyEn:
      "Return shipping is the customer's responsibility, unless the item arrived defective, damaged or incorrect (see §7 below) — in those cases we cover the return label. We recommend a tracked courier; once a package is in the post, the risk of loss is on whichever side is paying.",
    bodyKa:
      "დაბრუნების მიწოდების ღირებულება ეკისრება მომხმარებელს, თუ ნივთი არ ჩამოვიდა დეფექტიანი, დაზიანებული ან არასწორი (იხ. §7) — ამ შემთხვევაში ჩვენ ვფარავთ ხარჯს. ვურჩევთ ტრეკინგით გადატანას; ფოსტაში გადაცემის შემდეგ დაკარგვის რისკი ეკისრება იმ მხარეს, რომელიც იხდის.",
  },
  {
    headingEn: "6. Refund processing",
    headingKa: "6. ანაზღაურების დამუშავება",
    bodyEn:
      "Once we receive your returned items and confirm the condition, we issue the refund within 14 days using the same payment method you used at checkout. Card refunds typically settle in 3–10 business days depending on your bank. We refund the price of the returned items only — original shipping fees aren't refunded for change-of-mind returns. For defective items we refund shipping in both directions.",
    bodyKa:
      "დაბრუნებული ნივთების მიღების და მდგომარეობის დადასტურების შემდეგ თანხას დაგიბრუნებთ 14 დღის განმავლობაში გადახდის იმავე მეთოდით, რომელიც გამოიყენე გადახდისას. ბარათით ანაზღაურება ჩვეულებრივ ხდება 3-10 სამუშაო დღეში ბანკიდან გამომდინარე. ვანაზღაურებთ მხოლოდ დაბრუნებული ნივთების ფასს — თავდაპირველი მიწოდების საფასური არ ანაზღაურდება გადაწყვეტილების შეცვლის შემთხვევაში. დეფექტიანი ნივთების შემთხვევაში ვანაზღაურებთ მიწოდების ღირებულებას ორივე მიმართულებით.",
  },
  {
    headingEn: "7. Defective, damaged or incorrect items",
    headingKa: "7. დეფექტიანი, დაზიანებული ან არასწორი ნივთები",
    bodyEn:
      "If the item arrives damaged, defective or different from what you ordered, contact us within 7 days of delivery with photos. We will arrange a replacement at our cost or a full refund (item + original shipping + return shipping) at your choice. Your statutory rights as a consumer in Georgia are not affected by this policy.",
    bodyKa:
      "თუ ნივთი ჩამოვიდა დაზიანებული, დეფექტიანი ან არ ემთხვევა შეკვეთას, დაგვიკავშირდი ჩაბარებიდან 7 დღის განმავლობაში ფოტოებთან ერთად. შემოგთავაზებთ ჩანაცვლებას ჩვენი ხარჯით ან სრულ ანაზღაურებას (ნივთი + თავდაპირველი მიწოდება + დაბრუნების მიწოდება) შენი არჩევანის შესაბამისად. ეს პოლიტიკა არ ცვლის შენი მომხმარებლის უფლებებს საქართველოს კანონის შესაბამისად.",
  },
  {
    headingEn: "8. Exchanges",
    headingKa: "8. გაცვლა",
    bodyEn:
      "We don't process direct exchanges — return the original item under the policy above and place a new order for the replacement. This keeps the process clean for both sides and is faster than tying the refund to a new shipment.",
    bodyKa:
      "პირდაპირ გაცვლას არ ვამუშავებთ — დააბრუნე თავდაპირველი ნივთი ზემოთ მითითებული წესით და განათავსე ახალი შეკვეთა საჭირო ნივთზე. ეს უფრო სუფთად მიდის ორივე მხრიდან და უფრო სწრაფია, ვიდრე ანაზღაურების ახალ მიწოდებაზე მიბმა.",
  },
  {
    headingEn: "9. International returns",
    headingKa: "9. საერთაშორისო დაბრუნებები",
    bodyEn:
      "International orders follow the same 24-hour window. The customer covers return shipping (including any customs duties on the return leg) for change-of-mind returns. For defective international items, contact us first — depending on the issue we may issue a refund without requiring you to ship the item back.",
    bodyKa:
      "საერთაშორისო შეკვეთები ექვემდებარება იმავე 24-საათიან ვადას. გადაწყვეტილების შეცვლის შემთხვევაში მომხმარებელი ფარავს დაბრუნების ხარჯს (გადასახადების ჩათვლით დაბრუნების მიმართულებით). დეფექტიანი საერთაშორისო ნივთის შემთხვევაში ჯერ დაგვიკავშირდი — შესაძლოა ანაზღაურება გავცეთ ნივთის უკან გაგზავნის გარეშე.",
  },
  {
    headingEn: "10. Contact",
    headingKa: "10. კონტაქტი",
    bodyEn:
      `Return questions are welcome at ${BUSINESS.email} or via WhatsApp using the number in the footer. We answer most within a few hours during working days.`,
    bodyKa:
      `დაბრუნებასთან დაკავშირებული შეკითხვები — ${BUSINESS.email} ან WhatsApp ფუტერში მითითებული ნომრით. უმეტესობას ვპასუხობთ რამდენიმე საათში სამუშაო დღეებში.`,
  },
];
