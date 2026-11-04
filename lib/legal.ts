/**
 * Legal copy — Terms & Conditions, Privacy Policy, Refund/Returns Policy.
 *
 * Rewritten on 2026-11-03 from the owner's final text ("Nitchiani_2026-10-21.docx"). The
 * Georgian is that document's wording; the English is a translation of it and must be kept in
 * step with it — when the Georgian changes, change both. Neither has been reviewed by a
 * Georgian lawyer; that review is still worth having before the pages are treated as binding.
 *
 * Three things the text commits the shop to, which the rest of the site has to honour:
 *   - A 14-calendar-day right of withdrawal (it was 24 hours). Every other mention of the
 *     return window — the cart's "how it works" sheet, the About page, page metadata — says
 *     the same.
 *   - Card payment only; no cash on delivery. Checkout hides cash on delivery and bank
 *     transfer to match (see `SHOW_CASH_ON_DELIVERY` in CheckoutForm.tsx).
 *   - The delivery chain: orders reach a courier through the QuickShipper platform, and
 *     Privacy §5 names every recipient of the customer's data. As the controller we owe that
 *     disclosure, so it is also made at the point of collection — the notice above the
 *     checkout submit button — and not only on this page.
 *
 * One design decision a reviewer should know the reasoning for: the marketing tick at checkout
 * is separate from that notice, unticked by default and not a condition of buying, because
 * consent under the Georgian Personal Data Protection Law has to be specific and informed. A
 * single blanket "I agree" covering both the delivery transfers and marketing would be
 * neither. Keep the two apart if this file is rewritten. There is a local note on the
 * commercial background — see `docs/delivery-contract.local.md`, which is not committed.
 *
 * Entity details (legal name, registration ID, address, email, phone) are NOT hardcoded
 * here — they come from `lib/business.ts`, so one edit updates every legal page and the footer.
 *
 * Structured as an array of `{ headingEn, headingKa, bodyEn, bodyKa }` so the page can render
 * the right locale's sections without two `if` branches. Body paragraphs are split by `\n\n`
 * at render time.
 */

import { BUSINESS, businessAddress } from "./business";

export type LegalSection = {
  headingEn: string;
  headingKa: string;
  bodyEn: string;
  bodyKa: string;
};

const EMAIL = BUSINESS.email;
const PHONE = BUSINESS.phone;
const ID = BUSINESS.registrationId;
const NAME_KA = BUSINESS.legalName.ka;
const NAME_EN = BUSINESS.legalName.en;
const ADDRESS_KA = businessAddress("ka");
const ADDRESS_EN = businessAddress("en");

export const TERMS_LAST_UPDATED = "2026-11-03";

export const TERMS_SECTIONS: LegalSection[] = [
  {
    headingEn: "1. Seller",
    headingKa: "1. გამყიდველი",
    bodyEn: `The Site is operated, and the goods are sold, by ${NAME_EN} (individual entrepreneur, identification code ${ID}), address: ${ADDRESS_EN} ("we"). Contact: ${EMAIL}, phone / WhatsApp ${PHONE}.`,
    bodyKa: `საიტს მართავს და საქონელს ყიდის ${NAME_KA} (ინდივიდუალური მეწარმე, საიდენტიფიკაციო კოდი ${ID}), მისამართი: ${ADDRESS_KA} („ჩვენ“). კონტაქტი: ${EMAIL}, ტელეფონი / WhatsApp ${PHONE}.`,
  },
  {
    headingEn: "2. Who can order",
    headingKa: "2. ვინ შეიძლება შეუკვეთოს",
    bodyEn:
      "Anyone aged 18 or over can place an order. A person under 18 can place an order only with the consent of a parent or other legal representative, in accordance with the Civil Code of Georgia. You are responsible for the accuracy of the details you provide (name, address, phone, email).",
    bodyKa:
      "შეკვეთის გაფორმება შეუძლია 18 წელს მიღწეულ პირს. 18 წლამდე პირს შეკვეთის გაფორმება შეუძლია მხოლოდ მშობლის ან სხვა კანონიერი წარმომადგენლის თანხმობით, საქართველოს სამოქალაქო კოდექსის შესაბამისად. თქვენ პასუხისმგებელი ხართ მითითებული მონაცემების (სახელი, მისამართი, ტელეფონი, ელ-ფოსტა) სისწორეზე.",
  },
  {
    headingEn: "3. Products and prices",
    headingKa: "3. პროდუქტები და ფასები",
    bodyEn:
      "Each product page shows the product's main characteristics, its price and, where relevant, the variant (colour, length). A slight difference in colour in a photo may be caused by your screen settings. Prices are in Georgian lari (₾) and include all taxes; the delivery fee is shown separately at checkout, before you confirm the order. An amount shown in another currency is for information only. The price does not change after you order. If a price was shown by an obvious technical error, we will tell you and you may cancel the order — in that case we refund what you paid in full. The conditions of a discount code (validity period, single use, etc.) are stated with the code.",
    bodyKa:
      "პროდუქტის გვერდზე მითითებულია მისი ძირითადი მახასიათებლები, ფასი და, საჭიროების შემთხვევაში, ვარიანტი (ფერი, სიგრძე). ფოტოზე ფერის მცირე განსხვავება შესაძლოა გამოწვეული იყოს ეკრანის პარამეტრებით. ფასები მითითებულია ლარში (₾) და მოიცავს ყველა გადასახადს; მიწოდების საფასური ცალკე ჩანს გადახდის გვერდზე, შეკვეთის დადასტურებამდე. სხვა ვალუტაში ნაჩვენები თანხა მხოლოდ საცნობაროა. შეკვეთის შემდეგ ფასი არ იცვლება. თუ ფასი აშკარა ტექნიკური შეცდომით იყო მითითებული, შეგატყობინებთ და შეგიძლიათ შეკვეთა გააუქმოთ - ასეთ შემთხვევაში გადახდილ თანხას სრულად დაგიბრუნებთ. ფასდაკლების კოდის პირობები (მოქმედების ვადა, ერთჯერადობა და სხვ.) მითითებულია კოდთან ერთად.",
  },
  {
    headingEn: "4. Forming the contract",
    headingKa: "4. ხელშეკრულების დადება",
    bodyEn:
      "Listing a product on the Site is an invitation to make an offer. By pressing the \"Order with obligation to pay\" / payment-confirmation button you make an offer. The contract is concluded when we send you an order confirmation (the acceptance) by email or WhatsApp. If we cannot fulfil the order (for example, the stock has run out), we will tell you immediately and refund what you paid in full no later than 14 calendar days later.",
    bodyKa:
      "საიტზე პროდუქტის განთავსება არის მოწვევა შეთავაზების გასაკეთებლად. ღილაკზე „შეკვეთა გადახდის ვალდებულებით“/გადახდის დადასტურებით თქვენ აკეთებთ შეთავაზებას (ოფერტს). ხელშეკრულება დადებულად ითვლება, როდესაც ელ-ფოსტით ან WhatsApp-ით გამოგიგზავნით შეკვეთის დადასტურებას (აქცეპტს). თუ შეკვეთას ვერ შევასრულებთ (მაგ., მარაგი ამოიწურა), შეგატყობინებთ დაუყოვნებლივ და გადახდილ თანხას სრულად დაგიბრუნებთ არაუგვიანეს 14 კალენდარული დღისა.",
  },
  {
    headingEn: "5. Payment",
    headingKa: "5. გადახდა",
    bodyEn:
      "Payment is made by Visa or Mastercard card, on the secure payment page of Bank of Georgia or TBC Bank. Card details are not stored on our servers. Cash payment on delivery is not accepted.",
    bodyKa:
      "გადახდა ხდება Visa ან Mastercard ბარათით, საქართველოს ბანკის ან თიბისი ბანკის უსაფრთხო გადახდის გვერდზე. ბარათის მონაცემები ჩვენს სერვერებზე არ ინახება. ნაღდი ანგარიშსწორება მიწოდებისას არ ხორციელდება.",
  },
  {
    headingEn: "6. Delivery",
    headingKa: "6. მიწოდება",
    bodyEn:
      "Orders are dispatched from Tbilisi. The estimated delivery time is 1–3 working days in Tbilisi and 3–7 working days in the regions. In any case, unless we agree another time, we will deliver the goods no later than 30 calendar days after the contract is concluded. If we cannot deliver within that time, you may set us an additional reasonable period and, once it has passed, withdraw from the contract and demand a full refund of what you paid.\n\n" +
      "Delivery is handled with the help of the platform LLC \"QuickShipper\", which passes the order to one of the courier companies available. The choice of courier does not change our responsibility to you: the risk of loss or damage passes to you only when you, or a person you name (other than the courier), take delivery of the item.\n\n" +
      "If delivery fails because of a wrong or incomplete address or map pin that you gave, or because the recipient is not found at the address, the cost of the repeat delivery is yours; we will tell you the amount in advance.\n\n" +
      `You can collect your order free of charge at ${BUSINESS.street.en}, Tbilisi ("I'll pick it up in Tbilisi"). In that case the risk passes to you when you collect the order.`,
    bodyKa:
      "შეკვეთა იგზავნება თბილისიდან. მიწოდების სავარაუდო ვადაა: თბილისში 1-3 სამუშაო დღე, რეგიონებში 3-7 სამუშაო დღე. ნებისმიერ შემთხვევაში, თუ სხვა ვადაზე არ შევთანხმდით, საქონელს მოგაწვდით ხელშეკრულების დადებიდან არაუგვიანეს 30 კალენდარული დღისა. თუ ამ ვადაში ვერ მოგაწოდებთ, შეგიძლიათ განგვისაზღვროთ დამატებითი გონივრული ვადა, ხოლო მისი გასვლის შემდეგ უარი თქვათ ხელშეკრულებაზე და მოითხოვოთ გადახდილი თანხის სრულად დაბრუნება.\n\n" +
      "მიწოდებაში გვეხმარება პლატფორმა შპს „ქვიქშიფერი“, რომელიც შეკვეთას გადასცემს ერთ-ერთ ხელმისაწვდომ კურიერ-კომპანიას. კურიერის შერჩევა არ ცვლის ჩვენს პასუხისმგებლობას თქვენ წინაშე: ნივთის დაკარგვის ან დაზიანების რისკი თქვენზე გადადის მხოლოდ მაშინ, როდესაც ნივთს თქვენ ან თქვენ მიერ მითითებული პირი (კურიერის გარდა) ჩაიბარებს.\n\n" +
      "თუ მიწოდება ვერ შედგა თქვენ მიერ მითითებული არასწორი ან არასრული მისამართის, რუკის პინის გამო, ან, თუკი ადრესატი მისამართზე არ გვხვდება, ხელახალი მიწოდების ხარჯი თქვენ გეკისრებათ, ამ ხარჯის ოდენობას წინასწარ შეგატყობინებთ.\n\n" +
      `შეკვეთის გატანა შესაძლებელია უფასოდ, მისამართზე ${BUSINESS.street.ka}, თბილისი („თვითონ გავიტან თბილისში“). ამ შემთხვევაში რისკი თქვენზე გადადის შეკვეთის გატანისას.`,
  },
  {
    headingEn: "7. Right to withdraw from the contract (14 days)",
    headingKa: "7. ხელშეკრულებაზე უარის თქმის უფლება (14 დღე)",
    bodyEn:
      "If you buy as a consumer (not for business purposes), under the Georgian Law on Consumer Rights Protection you may withdraw from the contract within 14 calendar days, without giving a reason. The period runs from the day you, or a person you name (other than the courier), received the item; where several items are delivered separately, from receipt of the last one.\n\n" +
      `To use the right, send us a statement before the period ends by email (${EMAIL}) or WhatsApp (${PHONE}). You may use the model form at the end of these terms, but you do not have to. We will confirm receipt of your statement immediately.\n\n` +
      "Return the item to us, or hand it to a person we name, without delay and no later than 14 calendar days after notifying us that you withdraw. You pay the direct cost of returning the item.\n\n" +
      "We will refund what you paid, including the original standard delivery fee, in full and no later than 14 calendar days after receiving your statement, by the same means of payment you used, with no additional fee. If you chose a delivery dearer than the standard one, we do not refund the difference. We may hold the refund until we have received the item or you have shown proof that you sent it — whichever is earlier.\n\n" +
      "You may examine the item as you would in a shop. If the item has lost value because it was handled more than needed to check its nature, characteristics and function (for example, synthetic hair that was braided, cut, washed or brushed), you are responsible for that loss in value.\n\n" +
      "The right of withdrawal does not apply to sealed goods that cannot be returned for health or hygiene reasons if the seal was broken after delivery (for example wax, leave-in conditioner, oils, gels), nor to goods made to your individual specification. Synthetic hair is not covered by this exception: it can be returned even if the packaging has been opened, as long as it has not been used.",
    bodyKa:
      "თუ ნივთს ყიდულობთ როგორც მომხმარებელი (არა სამეწარმეო მიზნით), „მომხმარებლის უფლებების დაცვის შესახებ“ საქართველოს კანონის შესაბამისად, შეგიძლიათ უარი თქვათ ხელშეკრულებაზე 14 კალენდარული დღის განმავლობაში, მიზეზის მითითების გარეშე. ვადა აითვლება იმ დღიდან, როდესაც თქვენ ან თქვენ მიერ მითითებულმა პირმა (კურიერის გარდა) ნივთი მიიღეთ; რამდენიმე ნივთის ცალ-ცალკე მიწოდებისას, ბოლო ნივთის მიღებიდან.\n\n" +
      `უფლებით სარგებლობისთვის ვადის გასვლამდე გამოგვიგზავნეთ განცხადება ელ-ფოსტით (${EMAIL}) ან WhatsApp-ით (${PHONE}). შეგიძლიათ გამოიყენოთ ამ პირობების ბოლოს მოცემული ნიმუშის ფორმა, თუმცა ეს სავალდებულო არ არის. განცხადების მიღებას დაუყოვნებლივ დაგიდასტურებთ.\n\n` +
      "ნივთი დაგვიბრუნეთ ან გადაეცით ჩვენ მიერ მითითებულ პირს დაუყოვნებლივ, არაუგვიანეს 14 კალენდარული დღისა უარის თქმის შესახებ შეტყობინებიდან. ნივთის დაბრუნების პირდაპირ ხარჯს იხდით თქვენ.\n\n" +
      "გადახდილ თანხას, მათ შორის თავდაპირველი სტანდარტული მიწოდების საფასურს, დაგიბრუნებთ სრულად, არაუგვიანეს 14 კალენდარული დღისა თქვენი განცხადების მიღებიდან, იმავე გადახდის საშუალებით, რომლითაც გადაიხადეთ, დამატებითი საკომისიოს გარეშე. თუ თავად აირჩიეთ სტანდარტულზე ძვირი მიწოდება, სხვაობას არ ვანაზღაურებთ. შეგვიძლია თანხის დაბრუნება შევაჩეროთ, სანამ ნივთს არ მივიღებთ ან სანამ არ წარმოადგენთ მისი გამოგზავნის დამადასტურებელ დოკუმენტს - რომელიც უფრო ადრე მოხდება.\n\n" +
      "ნივთის დათვალიერება შეგიძლიათ ისე, როგორც ამას მაღაზიაში გააკეთებდით. თუ ნივთის ღირებულება შემცირდა იმის გამო, რომ ის მისი ბუნების, მახასიათებლებისა და ფუნქციონირების შესამოწმებლად საჭიროზე მეტად იქნა გამოყენებული (მაგ., ხელოვნური თმა დაწნული, შეჭრილი, დაბანილი ან დავარცხნილი), ღირებულების ამ შემცირებაზე პასუხისმგებელი ხართ თქვენ.\n\n" +
      "უარის თქმის უფლება არ ვრცელდება დალუქულ საქონელზე, რომლის დაბრუნებაც ჯანმრთელობის დაცვის ან ჰიგიენური მიზეზებით არ შეიძლება, თუ მიწოდების შემდეგ ლუქი მოიხსნა (მაგ., ცვილი, ლივ-ინ კონდიციონერი, ზეთები, გელები), აგრეთვე მომხმარებლის მითითებით ინდივიდუალურად დამზადებულ საქონელზე. ხელოვნური თმა ამ გამონაკლისს არ მიეკუთვნება და გახსნილი შეფუთვის შემთხვევაშიც ბრუნდება, თუ გამოყენებული არ არის.",
  },
  {
    headingEn: "8. Faulty, damaged or incorrect items",
    headingKa: "8. ნაკლიანი, დაზიანებული ან არასწორი ნივთი",
    bodyEn:
      "We are obliged to deliver goods that conform to the contract and are free of defects. If an item is damaged, faulty or different from what you ordered, you may, in accordance with the law, demand that it be repaired or replaced, that the price be reduced, or that the contract be cancelled with a full refund, and also compensation for damage. In that case we cover all delivery and return costs. Please tell us within a reasonable time of finding the fault and, if you can, send a photo — this helps us settle the matter quickly, but it does not limit your statutory rights.",
    bodyKa:
      "ჩვენ ვალდებული ვართ მოგაწოდოთ ხელშეკრულების შესაბამისი, უნაკლო ნივთი. თუ ნივთი დაზიანებული, ნაკლიანი ან შეკვეთისგან განსხვავებულია, შეგიძლიათ კანონის შესაბამისად მოითხოვოთ ნივთის შეკეთება ან შეცვლა, ფასის შემცირება ან ხელშეკრულებაზე უარის თქმა და თანხის სრულად დაბრუნება, ასევე ზიანის ანაზღაურება. ამ შემთხვევაში მიწოდებისა და დაბრუნების ყველა ხარჯს ვფარავთ ჩვენ. გთხოვთ, ნაკლის აღმოჩენისთანავე, გონივრულ ვადაში გვაცნობოთ და, შესაძლებლობის შემთხვევაში, ფოტოც გამოგვიგზავნოთ - ეს დაგვეხმარება საკითხის სწრაფად მოგვარებაში, თუმცა ეს თქვენს კანონით გათვალისწინებულ უფლებებს არ ზღუდავს.",
  },
  {
    headingEn: "9. Intellectual property",
    headingKa: "9. ინტელექტუალური საკუთრება",
    bodyEn:
      "The content on the Site, including the Nitchiani name and logo, photographs and texts, is our property or used under licence, and is protected by law. Using it for commercial purposes without our prior written permission is not allowed. Personal, non-commercial use (for example, sharing a product link) is allowed.",
    bodyKa:
      "საიტზე განთავსებული შინაარსი, მათ შორის Nitchiani - ის სახელი და ლოგო, ფოტოები და ტექსტები, ჩვენი საკუთრებაა ან გამოიყენება ლიცენზიით და დაცულია კანონით. მისი კომერციული მიზნით გამოყენება ჩვენი წინასწარი წერილობითი ნებართვის გარეშე დაუშვებელია. პირადი, არაკომერციული გამოყენება (მაგ., პროდუქტის ბმულის გაზიარება) ნებადართულია.",
  },
  {
    headingEn: "10. Acceptable use of the Site",
    headingKa: "10. საიტის დასაშვები გამოყენება",
    bodyEn:
      "It is forbidden to use the Site for fraudulent orders, for using someone else's means of payment without permission, for giving false data, for disrupting the Site's operation, or for mass copying of material by automated means (scrapers, bots). In case of such a breach we may restrict access to the Site; this does not affect your lawful rights under a contract already concluded.",
    bodyKa:
      "აკრძალულია საიტის გამოყენება თაღლითური შეკვეთის, სხვისი გადახდის საშუალების უნებართვოდ გამოყენების, ცრუ მონაცემების მითითების, საიტის მუშაობის შეფერხების ან ავტომატური საშუალებებით (სკრეიპერი, ბოტი) მასალის მასობრივი კოპირების მიზნით. ასეთი დარღვევისას შეგვიძლია შევზღუდოთ საიტზე წვდომა, ეს არ ეხება უკვე დადებული ხელშეკრულებიდან თქვენს კანონიერ უფლებებს.",
  },
  {
    headingEn: "11. Liability",
    headingKa: "11. პასუხისმგებლობა",
    bodyEn:
      "We are liable as the law provides. Our liability is not limited for damage caused intentionally or by gross negligence, for injury to life, health or body, for your rights in respect of faulty goods, or in any case where the law does not permit liability to be limited. We are not liable for damage caused by circumstances beyond our control (force majeure), or for damage we could not reasonably have foreseen when the contract was concluded.",
    bodyKa:
      "ჩვენ პასუხს ვაგებთ კანონის შესაბამისად. ჩვენი პასუხისმგებლობა არ იზღუდება განზრახ ან უხეში გაუფრთხილებლობით მიყენებულ ზიანზე, სიცოცხლის, ჯანმრთელობის ან სხეულის დაზიანებაზე, ნაკლიან საქონელთან დაკავშირებულ თქვენს უფლებებზე და იმ შემთხვევებზე, როდესაც პასუხისმგებლობის შეზღუდვა კანონით დაუშვებელია. ჩვენ არ ვაგებთ პასუხს ზიანზე, რომელიც გამოწვეულია ჩვენი კონტროლის მიღმა არსებული გარემოებებით (დაუძლეველი ძალა), ან ზიანზე, რომელსაც ხელშეკრულების დადებისას გონივრულად ვერ გავითვალისწინებდით.",
  },
  {
    headingEn: "12. Changes to the terms",
    headingKa: "12. პირობების ცვლილება",
    bodyEn:
      "These terms may be reviewed and updated. The version in force when you place your order applies to that order.",
    bodyKa:
      "წარმოდგენილი პირობები, შესაძლოა, დაექვემდებაროს გადახედვას და განახლებას. თქვენს შეკვეთაზე ვრცელდება ის ვერსია, რომელიც შეკვეთის გაფორმებისას მოქმედებდა.",
  },
  {
    headingEn: "13. Complaints and disputes",
    headingKa: "13. საჩივრები და დავები",
    bodyEn:
      `You can submit a complaint by email (${EMAIL}) or WhatsApp. We will confirm that we received it and answer in writing within a reasonable time, no later than 14 calendar days.\n\n` +
      "These terms are governed by the law of Georgia. A dispute that cannot be settled by negotiation will be heard by the general courts of Georgia, under the statutory rules of jurisdiction. This provision does not take away rights you have under the mandatory consumer-protection rules of your country of residence.",
    bodyKa:
      `საჩივარი შეგიძლიათ წარმოადგინოთ ელ-ფოსტით (${EMAIL}) ან WhatsApp-ით. საჩივრის მიღებას დაგიდასტურებთ და წერილობით გიპასუხებთ გონივრულ ვადაში, არაუგვიანეს 14 კალენდარული დღისა.\n\n` +
      "ამ პირობებზე ვრცელდება საქართველოს კანონმდებლობა. დავა, რომელიც მოლაპარაკებით ვერ მოგვარდება, განიხილება საქართველოს საერთო სასამართლოებში, კანონით დადგენილი განსჯადობის წესების შესაბამისად. ეს დებულება არ გართმევთ იმ უფლებებს, რომლებიც თქვენი საცხოვრებელი ქვეყნის მომხმარებელთა დაცვის სავალდებულო ნორმებით გაქვთ.",
  },
  {
    headingEn: "Model form for withdrawing from the contract",
    headingKa: "ხელშეკრულებაზე უარის თქმის ნიმუშის ფორმა",
    bodyEn: `To: ${NAME_EN}, ${ADDRESS_EN}, ${EMAIL}. I declare that I withdraw from the contract of sale of the following item(s): ________. Order number: ______. Date ordered / date received: ______. Consumer's name and surname: ______. Address: ______. Signature (if submitted on paper): ______. Date: ______.`,
    bodyKa: `ადრესატი: ${NAME_KA}, ${BUSINESS.street.ka}, თბილისი, ${EMAIL}. ვაცხადებ, რომ უარს ვამბობ შემდეგი ნივთის/ნივთების ნასყიდობის ხელშეკრულებაზე: ________. შეკვეთის ნომერი: ______. შეკვეთის თარიღი / მიღების თარიღი: ______. მომხმარებლის სახელი, გვარი: ______. მისამართი: ______. ხელმოწერა (ქაღალდზე წარდგენისას): ______. თარიღი: ______.`,
  },
];

export const PRIVACY_LAST_UPDATED = "2026-11-03";

export const PRIVACY_SECTIONS: LegalSection[] = [
  {
    headingEn: "1. Controller",
    headingKa: "1. დამმუშავებელი",
    bodyEn: `The controller of your personal data is ${NAME_EN} (individual entrepreneur, identification code ${ID}), address: ${ADDRESS_EN}. For privacy matters: ${EMAIL}.`,
    bodyKa: `თქვენი პერსონალური მონაცემების დამმუშავებელია ${NAME_KA} (ინდივიდუალური მეწარმე, საიდენტიფიკაციო კოდი ${ID}), მისამართი: ${ADDRESS_KA}. კონფიდენციალურობის საკითხებზე: ${EMAIL}.`,
  },
  {
    headingEn: "2. What data we process",
    headingKa: "2. რა მონაცემებს ვამუშავებთ",
    bodyEn:
      "We process only the data we need: contact details (first name, surname, phone, email, address); the coordinates of the delivery point, if you place a pin on the map; order data (items, amounts, payment method, order history — card details are not stored by us); our correspondence with you (WhatsApp, email, chat); technical data (IP address, device, browser, pages viewed); and, if you consent, marketing preferences. We do not collect special-category data.",
    bodyKa:
      "ვამუშავებთ მხოლოდ საჭირო მონაცემებს: საკონტაქტო მონაცემებს (სახელი, გვარი, ტელეფონი, ელ-ფოსტა, მისამართი), მიწოდების წერტილის კოორდინატებს, თუ რუკაზე პინს მიუთითებთ, შეკვეთის მონაცემებს (ნივთები, თანხები, გადახდის მეთოდი, შეკვეთების ისტორია, ბარათის მონაცემები ჩვენთან არ ინახება), ჩვენთან მიმოწერას (WhatsApp, ელ-ფოსტა, ჩატი), ტექნიკურ მონაცემებს (IP მისამართი, მოწყობილობა, ბრაუზერი, ნანახი გვერდები), და, თანხმობის შემთხვევაში, მარკეტინგულ პრეფერენციებს. განსაკუთრებული კატეგორიის მონაცემებს არ ვაგროვებთ.",
  },
  {
    headingEn: "3. Purposes and legal bases",
    headingKa: "3. მიზნები და სამართლებრივი საფუძვლები",
    bodyEn:
      "Under the Georgian Law on Personal Data Protection, we process data: (a) to conclude and perform the contract — taking the order, delivery, returns and support, including passing your address and phone number to the delivery platform and the courier; (b) to comply with a legal obligation — accounting and tax records, and requests connected with consumer rights; (c) for our legitimate interest — preventing fraud and keeping the Site secure; (d) with your consent — direct marketing, the delivery partner's marketing offers and non-essential cookies. Each consent is separate, voluntary, not a condition of your order, and you can withdraw it at any time as easily as you gave it.",
    bodyKa:
      "„პერსონალურ მონაცემთა დაცვის შესახებ“ საქართველოს კანონის შესაბამისად, მონაცემებს ვამუშავებთ: (ა) ხელშეკრულების დადებისა და შესრულებისთვის - შეკვეთის მიღება, მიწოდება, დაბრუნება, მხარდაჭერა, მათ შორის მისამართისა და ტელეფონის გადაცემა მიწოდების პლატფორმისა და კურიერისთვის; (ბ) კანონით დაკისრებული ვალდებულების შესასრულებლად - საბუღალტრო და საგადასახადო ჩანაწერები, მომხმარებლის უფლებებთან დაკავშირებული მოთხოვნები; (გ) ჩვენი კანონიერი ინტერესისთვის - თაღლითობის პრევენცია, საიტის უსაფრთხოება; (დ) თქვენი თანხმობით - პირდაპირი მარკეტინგი, მიწოდების პარტნიორის მარკეტინგული შეთავაზებები და არააუცილებელი ქუქი-ფაილები. თითოეული თანხმობა ცალკეულია, ნებაყოფლობითია, არ არის შეკვეთის პირობა და ნებისმიერ დროს, ისევე მარტივად შეგიძლიათ გააუქმოთ, როგორც გაეცით.",
  },
  {
    headingEn: "4. Direct marketing",
    headingKa: "4. პირდაპირი მარკეტინგი",
    bodyEn: `We send marketing messages (email, SMS) only with your consent. Every message includes a simple, free way to unsubscribe; you can also write to us at ${EMAIL}. After your request we will stop marketing within the period set by law.`,
    bodyKa: `მარკეტინგულ შეტყობინებებს (ელ-ფოსტა, SMS) გიგზავნით მხოლოდ თქვენი თანხმობით. თითოეულ შეტყობინებაში მითითებულია გამოწერის უფასოდ გაუქმების მარტივი საშუალება, ასევე შეგიძლიათ მოგვწეროთ ${EMAIL} - ზე. მოთხოვნის მიღებიდან მარკეტინგს შევწყვეტთ კანონით დადგენილ ვადაში.`,
  },
  {
    headingEn: "5. Recipients of the data",
    headingKa: "5. მონაცემების მიმღებები",
    bodyEn:
      "We share data only to the extent each recipient needs: EchoDesk (order-management system and online chat); LLC \"QuickShipper\" (ID 405547877) — the delivery platform, and the SMS gateway it contracts; the courier company that carries the particular order (for example Wolt, Glovo, Georgian Post, Go Delivery); Google (Maps/Places — choosing an address; Analytics — only with consent); Bank of Georgia and TBC Bank (payment); Resend (emails); Netlify (hosting); public authorities — only where the law provides. Support service providers (EchoDesk, Resend, Netlify, Google) process data on our instructions and under a contract with us. The delivery platform and couriers may also process data for their own purposes, under their own privacy policies.",
    bodyKa:
      "მონაცემებს ვაზიარებთ მხოლოდ იმ მოცულობით, რამდენიც თითოეულ მიმღებს სჭირდება: EchoDesk (შეკვეთების მართვის სისტემა და ონლაინ ჩატი); შპს „ქვიქშიფერი“ (ს/ნ 405547877) - მიწოდების პლატფორმა და მის მიერ დაკონტრაქტებული SMS-გეითვეი; საკურიერო კომპანია, რომელიც კონკრეტულ შეკვეთას ეზიდება (მაგ., Wolt, Glovo, საქართველოს ფოსტა, Go Delivery); Google (Maps/Places - მისამართის არჩევა; Analytics - მხოლოდ თანხმობით); საქართველოს ბანკი და თიბისი ბანკი (გადახდა); Resend (ელ-წერილები); Netlify (ჰოსტინგი); სახელმწიფო ორგანოები - მხოლოდ კანონით გათვალისწინებულ შემთხვევაში. დამხმარე მომსახურების გამწევები (EchoDesk, Resend, Netlify, Google) მონაცემებს ამუშავებენ ჩვენი დავალებით და ჩვენთან დადებული ხელშეკრულების საფუძველზე. მიწოდების პლატფორმა და კურიერები შესაძლოა მონაცემებს საკუთარი მიზნებითაც ამუშავებდნენ, საკუთარი კონფიდენციალურობის პოლიტიკის მიხედვით.",
  },
  {
    headingEn: "6. Transfers abroad",
    headingKa: "6. მონაცემების საზღვარგარეთ გადაცემა",
    bodyEn:
      "Some service providers (Google, Resend, Netlify) process data outside Georgia, including in the USA. Such a transfer takes place only on a basis permitted by the Georgian Law on Personal Data Protection and in accordance with it.",
    bodyKa:
      "ზოგიერთი მომსახურების გამწევი (Google, Resend, Netlify) მონაცემებს ამუშავებს საქართველოს ფარგლებს გარეთ, მათ შორის აშშ-ში. ასეთი გადაცემა ხორციელდება მხოლოდ „პერსონალურ მონაცემთა დაცვის შესახებ“ საქართველოს კანონით დაშვებული საფუძვლით და მის შესაბამისად.",
  },
  {
    headingEn: "7. Retention periods",
    headingKa: "7. შენახვის ვადები",
    bodyEn:
      "Order and accounting records — for the period set by Georgian tax and accounting law; the record of marketing consent — for the life of the consent and 3 years after withdrawal, to prove it; the marketing list — until you unsubscribe or 24 months of inactivity; support correspondence — 24 months from the last message; server logs — 90 days. After the period ends, the data is deleted.",
    bodyKa:
      "შეკვეთისა და საბუღალტრო ჩანაწერები - საქართველოს საგადასახადო და საბუღალტრო კანონმდებლობით დადგენილი ვადით, მარკეტინგული თანხმობის ჩანაწერი, თანხმობის მოქმედების ვადით და გაუქმებიდან 3 წლით, მისი დადასტურების მიზნით, მარკეტინგული სია, გამოწერის გაუქმებამდე ან 24-თვიან უმოქმედობამდე; მხარდაჭერის მიმოწერა, ბოლო შეტყობინებიდან 24 თვე; სერვერის ლოგები, 90 დღე. ვადის გასვლის შემდეგ მონაცემები იშლება.",
  },
  {
    headingEn: "8. Security",
    headingKa: "8. უსაფრთხოება",
    bodyEn:
      "We apply appropriate technical and organisational measures: data is transmitted encrypted (TLS), you enter card details directly on the bank's payment page, and access to the system is restricted. In the event of an incident we will notify the relevant authority within the periods set by law and, where necessary, you.",
    bodyKa:
      "ვიყენებთ სათანადო ტექნიკურ და ორგანიზაციულ ზომებს: მონაცემები გადაიცემა დაშიფრულად (TLS), ბარათის მონაცემები შეგყავთ უშუალოდ ბანკის გადახდის გვერდზე, სისტემაზე წვდომა შეზღუდულია. ინციდენტის შემთხვევაში, კანონით დადგენილ ვადებში ვაცნობებთ შესაბამის სამსახურს და, საჭიროებისას, თქვენ.",
  },
  {
    headingEn: "9. Your rights",
    headingKa: "9. თქვენი უფლებები",
    bodyEn:
      `You have the right to: receive information about how your data is processed, and a copy of it; request correction of inaccurate data; request deletion of the data or that processing stop; request restriction (blocking) of processing; receive your data in a portable format, in the cases the law sets; withdraw consent at any time; not be subject to a decision based solely on automated processing (we take no such decisions); and complain to the relevant authority or to a court. Send your request to ${EMAIL}. We will answer free of charge, within the period set by law — no later than 10 working days, which in special cases may be extended by the period the law allows. If the data is held by an independent recipient (for example a courier), we will forward your request and tell you so.`,
    bodyKa:
      `გაქვთ უფლება: მიიღოთ ინფორმაცია თქვენი მონაცემების დამუშავების შესახებ და მათი ასლი, მოითხოვოთ არაზუსტი მონაცემების გასწორება, მოითხოვოთ მონაცემების წაშლა ან დამუშავების შეწყვეტა, მოითხოვოთ დამუშავების შეზღუდვა (დაბლოკვა), მიიღოთ მონაცემები გადატანად ფორმატში, კანონით დადგენილ შემთხვევებში, ნებისმიერ დროს გააუქმოთ თანხმობა, არ დაექვემდებაროთ მხოლოდ ავტომატიზებულ გადაწყვეტილებას (ჩვენ ასეთ გადაწყვეტილებებს არ ვიღებთ) და საჩივრით მიმართოთ შესაბამის სამსახურს ან სასამართლოს. მოთხოვნა გამოგვიგზავნეთ ${EMAIL}-ზე. გიპასუხებთ უსასყიდლოდ, კანონით დადგენილ ვადაში - არაუგვიანეს 10 სამუშაო დღისა, რომელიც განსაკუთრებულ შემთხვევაში შეიძლება გაგრძელდეს კანონით დაშვებული ვადით. თუ მონაცემები დამოუკიდებელ მიმღებთან (მაგ., კურიერთან) ინახება, მოთხოვნას გადავუგზავნით და ამის შესახებ გაცნობებთ.`,
  },
  {
    headingEn: "10. Minors",
    headingKa: "10. არასრულწლოვნები",
    bodyEn:
      "The Site is intended for adults. We process the data of a person under 16, where it rests on consent, only with the consent of a parent or legal representative. If you think we have received a minor's data without such consent, contact us and we will delete it.",
    bodyKa:
      "საიტი განკუთვნილია სრულწლოვნებისთვის. 16 წლამდე პირის მონაცემებს თანხმობის საფუძველზე ვამუშავებთ მხოლოდ მშობლის ან კანონიერი წარმომადგენლის თანხმობით. თუ ფიქრობთ, რომ ასეთი თანხმობის გარეშე მივიღეთ არასრულწლოვნის მონაცემები, დაგვიკავშირდით და წავშლით.",
  },
  {
    headingEn: "11. Changes",
    headingKa: "11. ცვლილებები",
    bodyEn:
      "If there is a material change we will tell you on the Site or by email. The current version of the policy is always on this page, with its date of update.",
    bodyKa:
      "არსებითი ცვლილების შემთხვევაში შეგატყობინებთ საიტზე ან ელ-ფოსტით. პოლიტიკის მოქმედი ვერსია ყოველთვის ამ გვერდზეა, განახლების თარიღით.",
  },
];

export const REFUND_LAST_UPDATED = "2026-11-03";

export const REFUND_SECTIONS: LegalSection[] = [
  {
    headingEn: "1. 14-day right of withdrawal",
    headingKa: "1. 14-დღიანი უარის თქმის უფლება",
    bodyEn: `If you bought the item as a consumer, you may withdraw from the purchase within 14 calendar days of receiving it, without giving a reason. Where several items are delivered separately, the period runs from receipt of the last one. Before the period ends, write to us by email (${EMAIL}) or WhatsApp (${PHONE}), quoting the order number; you may use the model form in the Terms & Conditions.`,
    bodyKa: `თუ ნივთი შეიძინეთ როგორც მომხმარებელმა, შეგიძლიათ უარი თქვათ შეძენაზე ნივთის მიღებიდან 14 კალენდარული დღის განმავლობაში, მიზეზის მითითების გარეშე. რამდენიმე ნივთის ცალ-ცალკე მიწოდებისას ვადა ბოლო ნივთის მიღებიდან აითვლება. ვადის გასვლამდე მოგვწერეთ ელ-ფოსტით (${EMAIL}) ან WhatsApp-ით (${PHONE}), შეკვეთის ნომრის მითითებით, შეგიძლიათ გამოიყენოთ წესებსა და პირობებში მოცემული ნიმუშის ფორმა.`,
  },
  {
    headingEn: "2. What can't be returned",
    headingKa: "2. რა არ ბრუნდება",
    bodyEn:
      "For hygiene reasons the following cannot be returned: sealed hair-care products (wax, leave-in conditioner, oils, gels) once the seal has been broken after delivery, and items made to your individual specification. Unopened care products can be returned. Synthetic hair can be returned even with the packaging opened, as long as it has not been used.",
    bodyKa:
      "ჰიგიენური მიზეზებით არ ბრუნდება დალუქული თმის მოვლის საშუალებები (ცვილი, ლივ-ინ კონდიციონერი, ზეთები, გელები), თუ მიწოდების შემდეგ ლუქი მოიხსნა, ასევე თქვენი მითითებით ინდივიდუალურად დამზადებული ნივთები. გაუხსნელი მოვლის საშუალებები ბრუნდება. ხელოვნური თმა ბრუნდება გახსნილი შეფუთვის შემთხვევაშიც, თუ გამოყენებული არ არის.",
  },
  {
    headingEn: "3. Condition of the item",
    headingKa: "3. ნივთის მდგომარეობა",
    bodyEn:
      "You may examine the item as you would in a shop. Synthetic hair, bonnets, durags and accessories should not be worn or used; with hair, do not braid, cut, wash or brush it. If the item has lost value through being used more than necessary, the amount of that loss in value may be deducted from the refund, and we will tell you beforehand. Your right of withdrawal is kept in that case too.",
    bodyKa:
      "ნივთის დათვალიერება შეგიძლიათ ისე, როგორც მაღაზიაში. ხელოვნური თმა, ბონეტი, დურაგი და აქსესუარები არ უნდა ატაროთ ან გამოიყენოთ; თმის შემთხვევაში - არ დაწნათ, შეჭრათ, დაბანოთ ან დავარცხნოთ. თუ ნივთის ღირებულება შემცირდა საჭიროზე მეტი გამოყენების გამო, დაბრუნებული თანხიდან შეიძლება გამოიქვითოს ღირებულების ამ შემცირების თანხა, რის შესახებაც წინასწარ გაცნობებთ. უარის თქმის უფლება ამ შემთხვევაშიც შენარჩუნებულია.",
  },
  {
    headingEn: "4. The return process and its cost",
    headingKa: "4. დაბრუნების პროცესი და ხარჯი",
    bodyEn:
      "After your notice you will receive a confirmation and the return address. Send or bring the item no later than 14 calendar days after your notice. You pay the direct cost of returning the item, except for a faulty, damaged or incorrect item. We recommend a shipment with tracking.",
    bodyKa:
      "თქვენი შეტყობინების შემდეგ მიიღებთ დადასტურებას და დაბრუნების მისამართს. ნივთი გამოგზავნეთ ან მოიტანეთ შეტყობინებიდან არაუგვიანეს 14 კალენდარული დღისა. ნივთის დაბრუნების პირდაპირ ხარჯს იხდით თქვენ, გარდა ნაკლიანი, დაზიანებული ან არასწორი ნივთის შემთხვევისა. გირჩევთ, გამოიყენოთ tracking-ის მქონე გზავნილი.",
  },
  {
    headingEn: "5. Refund",
    headingKa: "5. თანხის დაბრუნება",
    bodyEn:
      "We will refund the money, including the original standard delivery fee, in full and no later than 14 calendar days after receiving your notice, to the same card, with no additional fee. We may hold the refund until we have received the item or you have shown proof that you sent it. Your bank may need a few more working days to show the refund.",
    bodyKa:
      "თანხას, მათ შორის თავდაპირველი სტანდარტული მიწოდების საფასურს, დაგიბრუნებთ სრულად, არაუგვიანეს 14 კალენდარული დღისა თქვენი შეტყობინების მიღებიდან, იმავე ბარათზე, დამატებითი საკომისიოს გარეშე. თანხის დაბრუნება შეიძლება შევაჩეროთ ნივთის მიღებამდე ან გამოგზავნის დამადასტურებელი დოკუმენტის წარმოდგენამდე. ბანკის მიერ თანხის ასახვას შესაძლოა დამატებით რამდენიმე სამუშაო დღე დასჭირდეს.",
  },
  {
    headingEn: "6. Faulty, damaged or incorrect items",
    headingKa: "6. ნაკლიანი, დაზიანებული ან არასწორი ნივთი",
    bodyEn:
      "In that case you may, in accordance with the law, demand a replacement or repair, a price reduction, or a full refund; we cover the delivery and return costs. Please tell us as soon as you find the fault and, where you can, send a photo. This does not limit your statutory rights.",
    bodyKa:
      "ასეთ შემთხვევაში შეგიძლიათ კანონის შესაბამისად მოითხოვოთ ნივთის შეცვლა ან შეკეთება, ფასის შემცირება ან თანხის სრულად დაბრუნება; მიწოდებისა და დაბრუნების ხარჯებს ვფარავთ ჩვენ. გთხოვთ, გვაცნობოთ ნაკლის აღმოჩენისთანავე და, შესაძლებლობისას, ფოტოც გამოგზავნოთ. ეს თქვენს კანონით გათვალისწინებულ უფლებებს არ ზღუდავს.",
  },
  {
    headingEn: "7. Exchanges",
    headingKa: "7. გაცვლა",
    bodyEn:
      "We do not carry out direct exchanges: return the item as described above and place a new order.",
    bodyKa:
      "პირდაპირ გაცვლას არ ვახორციელებთ: დააბრუნეთ ნივთი ზემოაღნიშნული წესით და გააფორმეთ ახალი შეკვეთა.",
  },
  {
    headingEn: "8. Orders delivered abroad",
    headingKa: "8. საზღვარგარეთ მიწოდებული შეკვეთები",
    bodyEn:
      "The 14-day period also applies to orders delivered outside Georgia. If you change your mind, you pay the cost of the return (including any taxes). In the case of a faulty item, contact us first.",
    bodyKa:
      "საქართველოს გარეთ მიწოდებულ შეკვეთებზეც მოქმედებს 14 - დღიანი ვადა. გადაწყვეტილების შეცვლისას დაბრუნების ხარჯს (მათ შორის გადასახადებს) იხდით თქვენ. ნაკლიანი ნივთის შემთხვევაში ჯერ დაგვიკავშირდით.",
  },
];
