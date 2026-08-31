/**
 * Legal copy — Terms & Conditions, Privacy Policy, Refund/Returns Policy.
 *
 * IMPORTANT — all three are working drafts suitable for launch but **must be reviewed by a
 * Georgian lawyer** before being treated as binding. Lawyer should verify:
 *   - Terms §7 / Refund — confirm Right of Withdrawal wording matches the current statute
 *   - Terms §13 — confirm governing-law wording
 *   - Privacy lawful-basis claims and retention periods against the current GE data law
 *   - Privacy §9 (your rights) — confirm scope matches the GE Personal Data Protection Act
 *   - Whether any product category needs additional disclosures (cosmetics, hair tools, body
 *     jewellery / piercings — implant-grade alloy disclosures may be required)
 *
 * Entity details (legal name, registration ID, address) are NOT hardcoded here — they
 * come from `lib/business.ts` and are interpolated into the entity sections below.
 * Replace the placeholders in `business.ts` once, and every legal page + footer updates.
 *
 * Structured as an array of `{ headingEn, headingKa, bodyEn, bodyKa }` so the page can
 * render the right locale's sections without two `if` branches. Body paragraphs are split
 * by `\n\n` at render time (same convention as the journal posts).
 */

import { BUSINESS } from "./business";

export type LegalSection = {
  headingEn: string;
  headingKa: string;
  bodyEn: string;
  bodyKa: string;
};

export const TERMS_LAST_UPDATED = "2026-05-19";

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
      `Nitchiani is a brand based in Tbilisi, Georgia, specialising in hand-crafted braids, locs and haircare. The Site is operated by ${BUSINESS.legalName}, registered in Georgia under ID ${BUSINESS.registrationId}, with its registered address at ${BUSINESS.address}. You can reach us at ${BUSINESS.email} or via WhatsApp using the number displayed in the site footer.`,
    bodyKa:
      `Nitchiani არის თბილისში დაფუძნებული ბრენდი, რომელიც სპეციალიზდება ხელით ნაკეთ ფრჩხებში, ლოკსებში და თმის მოვლის პროდუქტებში. საიტს ოპერირებას უწევს ${BUSINESS.legalName}, რეგისტრირებული საქართველოში საიდენტიფიკაციო ნომრით ${BUSINESS.registrationId}, იურიდიული მისამართით ${BUSINESS.address}. დაგვიკავშირდით — ${BUSINESS.email} ან WhatsApp ნომრით, რომელიც გამოქვეყნებულია საიტის ფუტერში.`,
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
      "We accept the payment methods displayed at checkout, which include Bank of Georgia and TBC card processing, bank transfer, and cash on delivery (Tbilisi area only, subject to confirmation). For card payments, processing is handled by the respective payment provider and is subject to their terms. Payment confirmation may take up to one business day for bank-transfer orders; we will hold the items for you during that window.",
    bodyKa:
      "ჩვენ ვიღებთ გადახდის იმ მეთოდებს, რომლებიც ნაჩვენებია გადახდის გვერდზე: Bank of Georgia და TBC ბანკის ბარათები, ბანკის გადარიცხვა და ნაღდი ფული მიწოდებისას (მხოლოდ თბილისში, წინასწარი დადასტურებით). ბარათით გადახდა მუშავდება შესაბამისი გადახდის სერვისის მიერ და ექვემდებარება მათ პირობებს. ბანკის გადარიცხვით გადახდის შემთხვევაში ანგარიშსწორების დადასტურებას შესაძლოა დასჭირდეს ერთ სამუშაო დღემდე — ამ პერიოდის განმავლობაში ვინახავთ ნივთებს თქვენთვის.",
  },
  {
    headingEn: "7. Shipping and delivery",
    headingKa: "7. მიწოდება",
    bodyEn:
      "Orders are hand-prepared at our Tbilisi studio and dispatched within 1–3 business days. Standard delivery inside Tbilisi typically arrives in 1–3 business days; deliveries to the broader region of Georgia take 3–7 business days. International orders, where available, are quoted separately. Risk of loss passes to you on delivery to the address you provided. If no one is available at the address, the courier will follow their own retry policy, after which the order may be returned to us.",
    bodyKa:
      "შეკვეთები მზადდება ხელით ჩვენს თბილისის სტუდიოში და იგზავნება 1-3 სამუშაო დღეში. სტანდარტული მიწოდება თბილისში ხდება 1-3 სამუშაო დღეში; სხვა რეგიონებში მიწოდება — 3-7 სამუშაო დღეში. საერთაშორისო შეკვეთები (სადაც ხელმისაწვდომია) იანგარიშება ცალკე. დაკარგვის რისკი თქვენზე გადადის ნივთის ჩაბარების მომენტში მითითებულ მისამართზე. თუ მისამართზე არავინ იქნება, კურიერი იმოქმედებს თავისი წესების შესაბამისად — შემდგომში შეკვეთა შესაძლოა დაბრუნდეს ჩვენთან.",
  },
  {
    headingEn: "8. Right of withdrawal (24 hours)",
    headingKa: "8. უარის თქმის უფლება (24 საათი)",
    bodyEn:
      `Under the consumer protection legislation of Georgia, if you are a consumer (not buying for business purposes) you may withdraw from a distance-selling contract within 24 hours of receiving the goods, without giving any reason. To exercise this right, notify us by email at ${BUSINESS.email} or WhatsApp before the 24-hour window closes, and return the item in its original, unused, resaleable condition with all packaging. Return shipping is the customer's responsibility unless the item arrived defective. Once we receive the returned item we issue the refund using the original payment method within 14 days. Hygiene-sensitive items (e.g., opened hair-care bottles, used hair tools) are not eligible for return for hygiene reasons; this exception is allowed under the same legislation.`,
    bodyKa:
      `საქართველოს მომხმარებლის უფლებების დაცვის შესახებ კანონმდებლობის შესაბამისად, თუ თქვენ ხართ მომხმარებელი (არ ყიდულობთ კომერციული მიზნებისთვის), შეგიძლიათ უარი თქვათ დისტანციური ნასყიდობის ხელშეკრულებაზე ნივთის მიღებიდან 24 საათის განმავლობაში, მიზეზის მითითების გარეშე. ამ უფლების გამოყენებისთვის გვაცნობეთ ფოსტით ${BUSINESS.email} ან WhatsApp-ით 24-საათიანი ვადის გასვლამდე და დააბრუნეთ ნივთი თავდაპირველ, გამოუყენებელ, გასაყიდი მდგომარეობით, ყველა შესაფუთი ნივთით ერთად. დაბრუნების ღირებულება ეკისრება მომხმარებელს, გარდა იმ შემთხვევებისა, როდესაც ნივთი ჩამოვიდა დეფექტით. დაბრუნებული ნივთის მიღების შემდეგ ანაზღაურებას ვაუვადებთ თავდაპირველი გადახდის მეთოდით 14 დღის განმავლობაში. ჰიგიენისადმი მგრძნობიარე ნივთები (მაგ., გახსნილი თმის მოვლის ფლაკონები, გამოყენებული ხელსაწყოები) არ ექვემდებარება დაბრუნებას ჰიგიენური მიზეზებიდან გამომდინარე — ეს გამონაკლისი ნებადართულია იმავე კანონმდებლობით.`,
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
      `Questions about these terms or about your order are welcome at ${BUSINESS.email} or via WhatsApp using the number in the footer. We usually respond within a few hours during studio working days.`,
    bodyKa:
      `კითხვები ამ პირობებთან ან თქვენს შეკვეთასთან დაკავშირებით — ${BUSINESS.email} ან WhatsApp ფუტერში მითითებული ნომრით. ჩვეულებრივ ვპასუხობთ რამდენიმე საათში სამუშაო დღეების განმავლობაში.`,
  },
];

export const PRIVACY_LAST_UPDATED = "2026-05-20";

export const PRIVACY_SECTIONS: LegalSection[] = [
  {
    headingEn: "1. Who we are",
    headingKa: "1. ვინ ვართ",
    bodyEn:
      `This Privacy Policy explains how Nitchiani — operated by ${BUSINESS.legalName}, registered in Georgia under ID ${BUSINESS.registrationId}, with its registered address at ${BUSINESS.address} — collects, uses and protects the personal data you provide when you use nitchiani.shop (the "Site"). We are the data controller for the data described below. For questions reach us at ${BUSINESS.email}.`,
    bodyKa:
      `ეს კონფიდენციალურობის პოლიტიკა განმარტავს, როგორ აგროვებს, იყენებს და იცავს Nitchiani — ოპერირებული ${BUSINESS.legalName}-ის მიერ, რეგისტრირებული საქართველოში ნომრით ${BUSINESS.registrationId}, მისამართით ${BUSINESS.address} — იმ პერსონალურ მონაცემებს, რომელსაც გვაწვდი nitchiani.shop-ის ("საიტი") გამოყენებისას. ჩვენ ვართ ქვემოთ აღწერილი მონაცემების მაკონტროლებელი. შეკითხვებზე — ${BUSINESS.email}.`,
  },
  {
    headingEn: "2. What data we collect",
    headingKa: "2. რა მონაცემებს ვაგროვებთ",
    bodyEn:
      "We collect only what we need to take your order, ship it, support you afterwards and run the Site. This includes: contact details you give us (name, email, phone, shipping address); order details (items, amounts, payment method, order history); communications you send us (WhatsApp messages, emails); technical data automatically logged when you visit (IP address, device type, browser, pages viewed); and optional marketing data if you sign up to our newsletter (email and language preference). We do not collect special-category data (health, religion, biometrics) and we do not knowingly collect data from children under 16.",
    bodyKa:
      "ვაგროვებთ მხოლოდ იმას, რაც გვჭირდება შენი შეკვეთის მიღების, გაგზავნის, შემდგომი მხარდაჭერისა და საიტის გასაშვებად. ეს მოიცავს: საკონტაქტო მონაცემებს, რომელსაც გვაწვდი (სახელი, ფოსტა, ტელეფონი, მისამართი); შეკვეთის დეტალებს (ნივთები, თანხები, გადახდის მეთოდი, შეკვეთის ისტორია); შენ მიერ გამოგზავნილ კომუნიკაციას (WhatsApp, ფოსტა); ვიზიტისას ავტომატურად ჩაწერილ ტექნიკურ მონაცემებს (IP, მოწყობილობის ტიპი, ბრაუზერი, ნანახი გვერდები); და სურვილისამებრ — სიახლეების მიწერით (ფოსტა და ენის პრეფერენცია). არ ვაგროვებთ სპეციალური კატეგორიის მონაცემებს (ჯანმრთელობა, რელიგია, ბიომეტრია) და შეგნებულად არ ვაგროვებთ 16 წლამდე ბავშვების მონაცემებს.",
  },
  {
    headingEn: "3. Why we use it and on what lawful basis",
    headingKa: "3. რატომ ვიყენებთ და რა სამართლებრივი საფუძვლით",
    bodyEn:
      "Performance of contract — to take, fulfil and deliver your order, and to handle returns and customer support. Legitimate interest — to protect the Site against fraud and abuse, to analyse aggregated traffic patterns so we can improve the experience, and to follow up on abandoned carts in a non-intrusive way. Consent — to send marketing emails when you've opted in, and to use non-essential cookies. Legal obligation — to keep records the tax and consumer-protection authorities of Georgia require us to keep.",
    bodyKa:
      "ხელშეკრულების შესრულება — შენი შეკვეთის მიღება, შესრულება, მიწოდება, დაბრუნებების და მხარდაჭერის მართვა. ლეგიტიმური ინტერესი — საიტის დაცვა თაღლითობისგან, აგრეგირებული ტრაფიკის ანალიზი გამოცდილების გასაუმჯობესებლად და მიტოვებული კალათების არაინტრუზიული შეხსენებები. თანხმობა — სიახლეების გასაგზავნად, როდესაც დათანხმდი, და არააუცილებელი ქუქი-ფაილების გამოყენებისთვის. სამართლებრივი ვალდებულება — საქართველოს საგადასახადო და მომხმარებლის უფლებების ორგანოების მიერ მოთხოვნილი ჩანაწერების შენახვა.",
  },
  {
    headingEn: "4. Who we share it with",
    headingKa: "4. ვის ვუზიარებთ",
    bodyEn:
      "We never sell your data. We share only what's needed with: payment processors (Bank of Georgia, TBC Bank) to authorise and settle card payments; the shipping carrier we use for your order (only your delivery address and phone); our email-sending service (Resend) for order confirmations and, with your consent, marketing emails; hosting/infrastructure providers (Vercel, the database we operate on) under standard processor agreements; analytics (only if you've consented to non-essential cookies); the tax authority of Georgia when legally required. Each processor has its own published privacy notice — links available on request.",
    bodyKa:
      "შენს მონაცემებს არასოდეს ვყიდით. ვუზიარებთ მხოლოდ აუცილებელს: გადახდის სერვისებს (საქართველოს ბანკი, თიბისი) ბარათით გადახდის გასატარებლად; მიწოდების კურიერ-კომპანიას შენი შეკვეთისთვის (მხოლოდ მისამართი და ტელეფონი); ფოსტის გაგზავნის სერვისს (Resend) შეკვეთის დადასტურებებისთვის და თანხმობის შემთხვევაში — სიახლეებისთვის; ჰოსტინგ/ინფრასტრუქტურის სერვისებს (Vercel, ჩვენი ბაზა) სტანდარტული პროცესორის ხელშეკრულებებით; ანალიტიკას (მხოლოდ თუ დაეთანხმე არააუცილებელ ქუქი-ფაილებს); საქართველოს საგადასახადო ორგანოს კანონით მოთხოვნისას. თითოეულ პროცესორს აქვს თავისი გამოქვეყნებული პოლიტიკა — ბმულები ხელმისაწვდომია მოთხოვნით.",
  },
  {
    headingEn: "5. International transfers",
    headingKa: "5. საერთაშორისო გადაცემები",
    bodyEn:
      "Some of our processors are based outside Georgia — primarily in the EU and the United States. Where data leaves Georgia, we rely on standard contractual clauses or adequacy decisions where available, and we only use providers that publish equivalent or stronger data-protection practices than Georgian law requires.",
    bodyKa:
      "ჩვენი ზოგიერთი პროცესორი დაფუძნებულია საქართველოს გარეთ — უპირატესად ევროკავშირში და აშშ-ში. სადაც მონაცემები გადის საქართველოდან, ვეყრდნობით სტანდარტულ სახელშეკრულებო პუნქტებს ან მონაცემთა დაცვის ადეკვატურობის გადაწყვეტილებებს, სადაც ხელმისაწვდომია, და ვიყენებთ მხოლოდ ისეთ პროცესორებს, რომლებიც ქართულ კანონმდებლობასთან თანაბარ ან უფრო ძლიერ პრაქტიკას ინარჩუნებენ.",
  },
  {
    headingEn: "6. How long we keep it",
    headingKa: "6. რამდენ ხანს ვინახავთ",
    bodyEn:
      "Order records: 7 years after the order date (Georgian tax record-keeping requirement). Marketing emails: until you unsubscribe or 24 months of inactivity, whichever is sooner. Customer-support correspondence: 24 months after the last message. Technical/server logs: 90 days. Anonymised analytics: indefinitely. After a retention period ends, data is deleted or anonymised. You can also request earlier deletion under section 9 below.",
    bodyKa:
      "შეკვეთის ჩანაწერები: შეკვეთის თარიღიდან 7 წელი (საქართველოს საგადასახადო ვალდებულება). მარკეტინგული ფოსტა: გამოწერის გაუქმებამდე ან 24 თვის უმოქმედობამდე — რომელიც ადრე დადგება. მხარდაჭერის მიმოწერა: უკანასკნელი წერილიდან 24 თვე. ტექნიკური/სერვერული ლოგები: 90 დღე. ანონიმური ანალიტიკა: უსასრულოდ. შენახვის ვადის გასვლის შემდეგ მონაცემები იშლება ან ანონიმდება. ასევე შეგიძლია მოითხოვო ადრეული წაშლა მე-9 პუნქტის შესაბამისად.",
  },
  {
    headingEn: "7. Cookies and similar technologies",
    headingKa: "7. ქუქი-ფაილები და მსგავსი ტექნოლოგიები",
    bodyEn:
      "We use a small number of strictly necessary cookies to make the cart, wishlist, language and currency settings remember themselves across pages — these don't need consent. Anything optional (analytics, marketing pixels) only loads after you've given consent through our cookie banner. You can change your preference at any time via the link in the footer.",
    bodyKa:
      "ვიყენებთ მცირე რაოდენობით აუცილებელ ქუქი-ფაილებს, რათა კალათამ, სასურველთა სიამ, ენისა და ვალუტის პარამეტრებმა გვერდებს შორის დაიმახსოვრონ თავი — ისინი თანხმობას არ მოითხოვს. სურვილისამებრ (ანალიტიკა, მარკეტინგული პიქსელები) იტვირთება მხოლოდ მას შემდეგ, რაც დაეთანხმები ქუქი-ფაილების ბანერის მეშვეობით. პრეფერენცია ნებისმიერ დროს შეგიძლია შეცვალო ფუტერში მითითებული ბმულით.",
  },
  {
    headingEn: "8. Security",
    headingKa: "8. უსაფრთხოება",
    bodyEn:
      "Data in transit is encrypted with TLS. Card details are never touched by our servers — they're entered directly into Bank of Georgia / TBC Bank's hosted payment forms. Database access is restricted to a small number of named operators and is audit-logged. If a breach occurs that affects you, we'll notify you and the supervisory authority within the timeframe the law requires.",
    bodyKa:
      "გადაცემული მონაცემები დაშიფრულია TLS-ით. ბარათის დეტალები არასოდეს გადის ჩვენი სერვერებიდან — შეგყავ პირდაპირ საქართველოს ბანკის / თიბისის გადახდის ფორმაში. ბაზის წვდომა შეზღუდულია ცოტა რაოდენობის სახელობით ოპერატორებზე და აქვს აუდიტ-ჟურნალი. თუ მონაცემთა გაჟონვა მოხდება, რომელიც შენ შეგეხება, შეგატყობინებთ შენ და ზედამხედველ ორგანოს კანონით განსაზღვრულ ვადებში.",
  },
  {
    headingEn: "9. Your rights",
    headingKa: "9. შენი უფლებები",
    bodyEn:
      `Under the Georgian Personal Data Protection Act you have the right to: access the data we hold about you; correct anything that's inaccurate; ask us to delete data we no longer need; restrict or object to processing for marketing or legitimate-interest purposes; receive your data in a portable format; withdraw any consent you've given (without affecting prior processing); and lodge a complaint with the Georgian Personal Data Protection Service. To exercise any of these, email ${BUSINESS.email} — we respond within 30 days, usually much sooner.`,
    bodyKa:
      `საქართველოს პერსონალურ მონაცემთა დაცვის შესახებ კანონის შესაბამისად, შენ გაქვს უფლება: წვდომა შენი მონაცემებზე; გაასწორო არასწორი მონაცემები; მოითხოვო წაშლა, თუ მონაცემები აღარ გვჭირდება; შეზღუდო ან გააპროტესტო დამუშავება მარკეტინგის ან ლეგიტიმური ინტერესისთვის; მიიღო შენი მონაცემები გადატანად ფორმატში; გააუქმო შენ მიერ მოცემული თანხმობა (წინა დამუშავებაზე გავლენის გარეშე); და შეიტანო საჩივარი საქართველოს პერსონალურ მონაცემთა დაცვის სამსახურში. რომელიმე უფლების გამოსაყენებლად — ${BUSINESS.email}; ვპასუხობთ 30 დღეში, ჩვეულებრივ ბევრად ადრე.`,
  },
  {
    headingEn: "10. Children",
    headingKa: "10. ბავშვები",
    bodyEn:
      "The Site is intended for adults. We don't knowingly collect personal data from anyone under 16. If you believe we've collected data from a minor, contact us and we'll delete it.",
    bodyKa:
      "საიტი განკუთვნილია მოზრდილებისთვის. შეგნებულად არ ვაგროვებთ პერსონალურ მონაცემებს 16 წლამდე პირებისგან. თუ თვლი, რომ ჩვენ მოვაგროვეთ მონაცემები არასრულწლოვანისგან, დაგვიკავშირდი — წავშლით.",
  },
  {
    headingEn: "11. Changes to this policy",
    headingKa: "11. ცვლილებები ამ პოლიტიკაში",
    bodyEn:
      "If we change this policy in a way that materially affects you (for example, we add a new processor handling sensitive data), we'll notify you by email if you've signed up for marketing or by a banner on the Site. Less material updates will simply replace the previous version with the new \"Last updated\" date.",
    bodyKa:
      "თუ ამ პოლიტიკას შევცვლით ისე, რომ ეს არსებითად შეგეხება (მაგ., დავამატებთ ახალ პროცესორს, რომელიც სენსიტიურ მონაცემებს ამუშავებს), შეგატყობინებთ ფოსტით თუ ჩაწერილი ხარ მარკეტინგზე, ან საიტზე გამოვაქვეყნებთ ბანერს. ნაკლებად არსებითი განახლებები უბრალოდ ჩაანაცვლებენ წინა ვერსიას ახალი \"ბოლო განახლების\" თარიღით.",
  },
  {
    headingEn: "12. Contact",
    headingKa: "12. კონტაქტი",
    bodyEn:
      `Privacy questions and rights requests are welcome at ${BUSINESS.email} or via WhatsApp using the number in the footer. We answer most within a few hours during studio working days; rights requests get a written reply within 30 days.`,
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
      "For hygiene reasons, the following are excluded from the 24-hour withdrawal right once they've been opened or used: opened hair-care liquids (oils, rinses, gels); used hair tools (combs, picks, brushes); body jewellery / piercings that have been worn or have left their sealed sterile packaging; and any custom or made-to-order piece. The unopened versions of the first three categories remain returnable. This exception is allowed under the same Georgian consumer-protection statute that gives you the right.",
    bodyKa:
      "ჰიგიენური მიზეზებიდან გამომდინარე, შემდეგი ნივთები არ ექვემდებარება 24-საათიან დაბრუნებას, თუ გახსნილია ან გამოყენებულია: გახსნილი თმის მოვლის სითხეები (ზეთები, ჩამოსარეცხები, გელები); გამოყენებული ხელსაწყოები (სავარცხლები, პიკები, ფუნჯები); ნახმარი ან სტერილური შეფუთვიდან ამოღებული პირსინგი/საყურეები; ნებისმიერი ინდივიდუალურად დამზადებული ნივთი. პირველი სამი კატეგორიის გახსნელი ვერსიები კვლავ ექვემდებარება დაბრუნებას. ეს გამონაკლისი ნებადართულია იმავე ქართული კანონმდებლობით, რომელიც დაბრუნების უფლებას გვაძლევს.",
  },
  {
    headingEn: "3. Condition we need it in",
    headingKa: "3. რა მდგომარეობით უნდა დაბრუნდეს",
    bodyEn:
      "Items should come back unused, in their original packaging, with all tags, bags and protective wrapping intact. Bonnets, accessories and tools may be unwrapped and inspected (the same way you'd inspect a piece in a shop) but not worn or used. If the item arrives back with visible signs of use, we may offer a partial refund proportional to the loss of value.",
    bodyKa:
      "ნივთები უნდა დაბრუნდეს გამოუყენებლად, თავდაპირველი შეფუთვით, ყველა ეტიკეტით, ჩანთით და დამცავი ბაფთით. ბონნეტები, აქსესუარები და ხელსაწყოები შეიძლება გახსნა და დაათვალიერო (ისე, როგორც მაღაზიაში დაათვალიერებდი) — მაგრამ არ ატარო და არ გამოიყენო. თუ ნივთი დაბრუნდება ხმარების აშკარა ნიშნებით, შესაძლოა შემოგთავაზოთ ნაწილობრივი ანაზღაურება ღირებულების დაკარგვის პროპორციულად.",
  },
  {
    headingEn: "4. How to start a return",
    headingKa: "4. როგორ დავიწყო დაბრუნება",
    bodyEn:
      `Email ${BUSINESS.email} or WhatsApp us with your order number and which items you want to return. We'll send back a confirmation and the return address within a few hours during studio working days. Once you've shipped the package, send us the courier tracking number so we can keep an eye on it.`,
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
      "Once we receive your returned items and confirm the condition, we issue the refund within 14 days using the same payment method you used at checkout. Card refunds typically settle in 3–10 business days depending on your bank; bank-transfer refunds settle in 1–3 business days; cash-on-delivery refunds go to a bank account you provide. We refund the price of the returned items only — original shipping fees aren't refunded for change-of-mind returns. For defective items we refund shipping in both directions.",
    bodyKa:
      "დაბრუნებული ნივთების მიღების და მდგომარეობის დადასტურების შემდეგ ანაზღაურებას ვაუვადებთ 14 დღის განმავლობაში გადახდის იმავე მეთოდით, რომელიც გამოიყენე გადახდისას. ბარათით ანაზღაურება ჩვეულებრივ ხდება 3-10 სამუშაო დღეში ბანკიდან გამომდინარე; ბანკის გადარიცხვით — 1-3 სამუშაო დღეში; ნაღდი ანგარიშსწორებით შეკვეთებზე — შენ მიერ მითითებულ ანგარიშზე. ვაუვადებთ მხოლოდ დაბრუნებული ნივთების ფასს — თავდაპირველი მიწოდების საფასური არ ანაზღაურდება გადაწყვეტილების შეცვლის შემთხვევაში. დეფექტიანი ნივთების შემთხვევაში ვაუვადებთ მიწოდებას ორივე მიმართულებით.",
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
      `Return questions are welcome at ${BUSINESS.email} or via WhatsApp using the number in the footer. We answer most within a few hours during studio working days.`,
    bodyKa:
      `დაბრუნებასთან დაკავშირებული შეკითხვები — ${BUSINESS.email} ან WhatsApp ფუტერში მითითებული ნომრით. უმეტესობას ვპასუხობთ რამდენიმე საათში სამუშაო დღეებში.`,
  },
];
