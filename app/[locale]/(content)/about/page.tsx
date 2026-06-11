import { setRequestLocale } from "next-intl/server";
import type { Locale } from "@/lib/i18n/config";

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="container-shop pb-12">
      <div className="max-w-2xl">
        <p className="label-eyebrow mb-2">{locale === "ka" ? "ჩვენ შესახებ" : "About"}</p>
        <h1 className="font-display text-3xl tracking-tight sm:text-5xl">Nitchiani</h1>
        <p className="mt-6 text-base leading-relaxed opacity-85">
          {locale === "ka"
            ? "Nitchiani არის თბილისში დაფუძნებული ბრენდი, რომელიც სპეციალიზდება ხელით ნაკეთი ფრჩხებზე, ლოკსებსა და თმის მოვლის პროდუქტებზე. ჩვენი მიზანია — შემოგთავაზოთ პრემიუმ ხარისხი მინიმალისტურ ესთეტიკაში."
            : "Nitchiani is a Tbilisi-based brand specializing in hand-crafted braids, dreadlocks and haircare. Our mission is to bring premium quality wrapped in a minimalist, editorial aesthetic to a community that often has to import every essential."}
        </p>
      </div>
    </div>
  );
}
