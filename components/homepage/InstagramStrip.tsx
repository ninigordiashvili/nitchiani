import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { BLUR_DATA_URL } from "@/lib/images";
import { getInstagramFeed } from "@/lib/instagram";

function IgGlyph({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

export async function InstagramStrip() {
  const t = await getTranslations("home");
  const handle = process.env.NEXT_PUBLIC_INSTAGRAM_HANDLE ?? "nitchiani";
  const posts = await getInstagramFeed(6);

  return (
    <section>
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <p className="label-eyebrow mb-1.5">{t("follow")}</p>
          <h2 className="font-display text-2xl tracking-tight sm:text-3xl">
            {t("instagram")}
          </h2>
        </div>
        <a
          href={`https://instagram.com/${handle}`}
          target="_blank"
          rel="noreferrer noopener"
          className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.16em]"
        >
          <IgGlyph />
          {handle}
        </a>
      </div>
      <ul className="no-scrollbar flex snap-x snap-mandatory gap-2 overflow-x-auto sm:grid sm:grid-cols-6 sm:gap-3 sm:overflow-visible">
        {posts.map((post, i) => (
          <li
            key={post.id}
            className="relative aspect-square w-[42%] flex-shrink-0 snap-start overflow-hidden bg-black/5 sm:w-auto"
          >
            <a
              href={post.permalink}
              target="_blank"
              rel="noreferrer noopener"
              className="group block h-full w-full"
              aria-label={post.caption ? post.caption.slice(0, 80) : `Instagram post ${i + 1}`}
            >
              <Image
                src={post.imageUrl}
                alt={post.caption ? post.caption.slice(0, 120) : `Instagram post ${i + 1}`}
                fill
                sizes="(min-width: 640px) 16vw, 42vw"
                placeholder="blur"
                blurDataURL={BLUR_DATA_URL}
                className="object-cover transition-transform duration-500 ease-[var(--ease-brand)] group-hover:scale-105"
                unoptimized={post.imageUrl.startsWith("https://scontent") || post.imageUrl.startsWith("https://instagram.f")}
              />
              {post.isVideo ? (
                <span className="absolute top-2 right-2 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-medium text-white uppercase">
                  Reel
                </span>
              ) : null}
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
