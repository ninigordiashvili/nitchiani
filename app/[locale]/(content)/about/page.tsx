import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { localeAlternates } from "@/lib/seo";
import type { Locale } from "@/lib/i18n/config";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const title = locale === "ka" ? "ჩვენ შესახებ" : "About";
  const description =
    locale === "ka"
      ? "Nitchiani — თბილისში დაფუძნებული ბრენდი თმის მოვლის პროდუქტებისთვის."
      : "Nitchiani is a Tbilisi-based brand for hand-crafted braids, dreadlocks and loc-care essentials — premium quality in a minimalist, editorial aesthetic.";
  return {
    title,
    description,
    alternates: localeAlternates(locale, "/about"),
  };
}

export default async function AboutPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="container-shop pb-12">
      {/* Centred: the page is a single short statement, and left-aligning it against the full
          container width left it stranded in the top-left corner with the rest of the viewport
          empty. `max-w-2xl` still holds the line length to a readable measure. */}
      <div className="mx-auto max-w-2xl py-6 text-center sm:py-14">
        <p className="label-eyebrow mb-2">{locale === "ka" ? "ჩვენ შესახებ" : "About"}</p>
        <h1 className="font-display text-3xl tracking-tight sm:text-5xl">Nitchiani</h1>
        <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed opacity-85">
          {locale === "ka"
            ? "Nitchiani არის თბილისში დაფუძნებული ბრენდი, რომელიც სპეციალიზდება ხელით ნაკეთი ფრჩხებზე, ლოკსებსა და თმის მოვლის პროდუქტებზე. ჩვენი მიზანია — შემოგთავაზოთ პრემიუმ ხარისხი მინიმალისტურ ესთეტიკაში."
            : "Nitchiani is a Tbilisi-based brand specializing in hand-crafted braids, dreadlocks and haircare. Our mission is to bring premium quality wrapped in a minimalist, editorial aesthetic to a community that often has to import every essential."}
        </p>
      </div>
    </div>
  );
}
