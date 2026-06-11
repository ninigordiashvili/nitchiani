import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { ArrowRight } from "lucide-react";
import { Link } from "@/lib/i18n/routing";
import { BLUR_DATA_URL } from "@/lib/images";
import { JOURNAL_POSTS, getJournalPostBySlug } from "@/lib/journal";
import type { Locale } from "@/lib/i18n/config";

export function generateStaticParams() {
  return JOURNAL_POSTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = getJournalPostBySlug(slug);
  if (!post) return {};
  return {
    title: locale === "ka" ? post.titleKa : post.titleEn,
    description: locale === "ka" ? post.excerptKa : post.excerptEn,
    openGraph: {
      title: locale === "ka" ? post.titleKa : post.titleEn,
      description: locale === "ka" ? post.excerptKa : post.excerptEn,
      type: "article",
      publishedTime: post.publishedAt,
      images: [post.image],
    },
  };
}

export default async function JournalPostPage({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const post = getJournalPostBySlug(slug);
  if (!post) notFound();

  const t = await getTranslations("journal");
  const dateFormatter = new Intl.DateTimeFormat(locale === "ka" ? "ka-GE" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const title = locale === "ka" ? post.titleKa : post.titleEn;
  const body = locale === "ka" ? post.bodyKa : post.bodyEn;
  const author = locale === "ka" ? post.authorKa : post.authorEn;
  const paragraphs = body.split("\n\n");

  // Article structured data — Google uses this for News/Discover surfacing and the
  // author byline. We send the editorial author as a Person and the studio as the
  // publishing Organization.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    datePublished: post.publishedAt,
    inLanguage: locale === "ka" ? "ka-GE" : "en-US",
    image: post.image,
    description: locale === "ka" ? post.excerptKa : post.excerptEn,
    author: { "@type": "Person", name: author },
    publisher: { "@type": "Organization", name: "Nitchiani" },
  };

  // Surface the other two posts at the bottom — keeps users in the journal funnel and
  // hands Google a clear "related editorial" set.
  const otherPosts = JOURNAL_POSTS.filter((p) => p.slug !== post.slug).slice(0, 2);

  return (
    <article className="container-shop pb-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-3xl">
        <p className="text-[11px] tracking-wider uppercase opacity-60">
          {t("byline", { author })} · {dateFormatter.format(new Date(post.publishedAt))} ·{" "}
          {t("readingMinutes", { n: post.readingMinutes })}
        </p>
        <h1 className="font-display mt-2 text-3xl leading-[1.05] tracking-tight sm:text-5xl">
          {title}
        </h1>
        <p className="mt-4 text-base opacity-80 sm:text-lg">
          {locale === "ka" ? post.excerptKa : post.excerptEn}
        </p>
      </div>

      <div className="relative mt-8 aspect-[16/9] w-full overflow-hidden bg-black/5">
        <Image
          src={post.image}
          alt={title}
          fill
          sizes="(min-width: 1024px) 1024px, 100vw"
          priority
          placeholder="blur"
          blurDataURL={BLUR_DATA_URL}
          className="object-cover"
        />
      </div>

      <div className="mt-10 max-w-2xl space-y-5 text-base leading-relaxed opacity-90">
        {paragraphs.map((p, i) => (
          <Paragraph key={i} text={p} />
        ))}
      </div>

      {otherPosts.length > 0 ? (
        <section className="mt-16 border-t border-black/10 pt-10">
          <p className="label-eyebrow mb-4">{t("more")}</p>
          <ul className="grid gap-6 sm:grid-cols-2">
            {otherPosts.map((p) => (
              <li key={p.slug}>
                <Link href={`/journal/${p.slug}`} className="group flex gap-4">
                  <div className="relative aspect-square w-24 flex-shrink-0 overflow-hidden bg-black/5">
                    <Image
                      src={p.image}
                      alt={locale === "ka" ? p.titleKa : p.titleEn}
                      fill
                      sizes="96px"
                      placeholder="blur"
                      blurDataURL={BLUR_DATA_URL}
                      className="object-cover transition-transform duration-500 ease-[var(--ease-brand)] group-hover:scale-105"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-display text-base leading-tight">
                      {locale === "ka" ? p.titleKa : p.titleEn}
                    </p>
                    <span className="mt-2 inline-flex items-center gap-1 text-[11px] tracking-wider uppercase opacity-70 group-hover:opacity-100">
                      {t("readPost")} <ArrowRight size={12} />
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </article>
  );
}

/**
 * Renders a single paragraph from the body. Recognises `**bold**` pairs and converts them
 * to `<strong>` — enough markdown to support the inline emphasis we already use in the
 * loc-oil-routine post without dragging a full markdown parser in.
 */
function Paragraph({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <p>
      {parts.map((part, i) =>
        part.startsWith("**") && part.endsWith("**") ? (
          <strong key={i} className="font-semibold opacity-100">
            {part.slice(2, -2)}
          </strong>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </p>
  );
}
