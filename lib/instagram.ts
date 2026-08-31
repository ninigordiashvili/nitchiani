import { readdir } from "node:fs/promises";
import path from "node:path";

/**
 * Instagram feed loader with three-tier resolution:
 *
 *   1. Instagram API (Graph) — if INSTAGRAM_ACCESS_TOKEN is set, fetches /me/media via the
 *      Graph API. Cached for 30 minutes via Next.js fetch revalidation.
 *   2. Local /public/instagram/*.jpg|*.jpeg|*.png|*.webp — drop your own images here for an
 *      instant feed without API setup.
 *   3. Built-in placeholders (Unsplash) — last-resort fallback so the homepage section never
 *      renders empty during early development.
 *
 * Setup for tier 1 (Instagram API with Instagram Login — December 2024+ replacement for the
 * deprecated Basic Display API):
 *   - Convert your IG account to Business or Creator
 *   - Register an app at developers.facebook.com → add the "Instagram" product
 *   - Run the OAuth flow → exchange short-lived for long-lived token (60 days)
 *   - Set INSTAGRAM_ACCESS_TOKEN in .env.local; refresh before each expiry (or implement a cron)
 *
 * Docs: https://developers.facebook.com/docs/instagram-platform/instagram-api-with-instagram-login
 */

export type InstagramPost = {
  id: string;
  imageUrl: string;
  permalink: string;
  caption?: string;
  isVideo: boolean;
};

const PLACEHOLDER_POSTS: InstagramPost[] = [
  "ig-1",
  "ig-2",
  "ig-3",
  "ig-4",
  "ig-5",
  "ig-6",
].map((seed, i) => ({
  id: `placeholder-${i}`,
  imageUrl: `https://picsum.photos/seed/nitchiani-${seed}/600/600`,
  permalink: "https://instagram.com/Nitchiani.shop",
  isVideo: false,
}));

export async function getInstagramFeed(limit = 6): Promise<InstagramPost[]> {
  const live = await fetchFromGraphApi(limit).catch((err) => {
    console.warn("[instagram] Graph API fetch failed, falling back:", err?.message ?? err);
    return null;
  });
  if (live && live.length > 0) return live;

  const local = await readLocalImages(limit);
  if (local.length > 0) return local;

  return PLACEHOLDER_POSTS.slice(0, limit);
}

// ---------------------- Tier 1: Instagram Graph API ----------------------

async function fetchFromGraphApi(limit: number): Promise<InstagramPost[] | null> {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN;
  if (!token) return null;

  type GraphMediaResponse = {
    data?: {
      id: string;
      caption?: string;
      media_type: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";
      media_url?: string;
      thumbnail_url?: string;
      permalink: string;
      timestamp: string;
    }[];
  };

  const fields = "id,caption,media_type,media_url,thumbnail_url,permalink,timestamp";
  const url =
    `https://graph.instagram.com/me/media?fields=${fields}` +
    `&limit=${limit}&access_token=${encodeURIComponent(token)}`;

  const res = await fetch(url, {
    next: { revalidate: 1800, tags: ["instagram-feed"] },
  });

  if (!res.ok) {
    throw new Error(`Graph API ${res.status}: ${await res.text()}`);
  }

  const json = (await res.json()) as GraphMediaResponse;
  return (json.data ?? []).map((m) => ({
    id: m.id,
    imageUrl: m.media_type === "VIDEO" ? (m.thumbnail_url ?? "") : (m.media_url ?? ""),
    permalink: m.permalink,
    caption: m.caption,
    isVideo: m.media_type === "VIDEO",
  })).filter((p) => p.imageUrl);
}

// ---------------------- Tier 2: local files in /public/instagram ----------------------

async function readLocalImages(limit: number): Promise<InstagramPost[]> {
  const dir = path.join(process.cwd(), "public", "instagram");
  let entries: string[] = [];
  try {
    entries = await readdir(dir);
  } catch {
    return [];
  }

  const imageExt = /\.(jpe?g|png|webp|avif)$/i;
  const handle = process.env.NEXT_PUBLIC_INSTAGRAM_HANDLE ?? "Nitchiani.shop";
  return entries
    .filter((f) => imageExt.test(f))
    .sort()
    .slice(0, limit)
    .map((file, i) => ({
      id: `local-${i}-${file}`,
      imageUrl: `/instagram/${file}`,
      permalink: `https://instagram.com/${handle}`,
      isVideo: false,
    }));
}
