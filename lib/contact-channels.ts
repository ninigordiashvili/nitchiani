import { BUSINESS } from "./business";

/**
 * Direct-message links for the shop's channels.
 *
 * Each one opens a conversation, not a profile — the point is to land the customer in a chat
 * they can type into, which is a different URL from the page in the footer:
 *
 *  - `wa.me/<number>`   opens WhatsApp on that number.
 *  - `ig.me/m/<handle>` is Instagram's own DM deep link; instagram.com/<handle> is the profile
 *    and leaves the customer to find the message button themselves.
 *  - `m.me/<page id>`   opens Messenger for the page; facebook.com/profile.php?id=… is the page.
 *
 * All three hand off to the installed app on a phone and fall back to the web client
 * otherwise, so no per-platform branching is needed.
 */
export type ChatChannel = {
  key: "whatsapp" | "instagram" | "facebook";
  href: string;
  /** Brand names, deliberately untranslated — they read the same in both storefront languages. */
  label: string;
};

export function chatChannels(whatsappNumber: string): ChatChannel[] {
  const instagramHandle = process.env.NEXT_PUBLIC_INSTAGRAM_HANDLE ?? "Nitchiani.shop";
  return [
    { key: "whatsapp", href: `https://wa.me/${whatsappNumber}`, label: "WhatsApp" },
    { key: "instagram", href: `https://ig.me/m/${instagramHandle}`, label: "Instagram" },
    { key: "facebook", href: `https://m.me/${BUSINESS.facebookPageId}`, label: "Facebook" },
  ];
}
