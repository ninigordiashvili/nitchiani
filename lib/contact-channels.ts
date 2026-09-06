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
  /**
   * Whether the opening message is already in the box when the chat opens.
   *
   * Only WhatsApp supports it: `wa.me` takes a `text` parameter. Instagram's `ig.me` and
   * Messenger's `m.me` accept no message at all — `m.me`'s `ref` is a payload handed to a
   * bot, never shown to the person — so for those the caller copies the message to the
   * clipboard instead and the shopper pastes it. Prefill is not something we can fake with
   * a query string those platforms will simply ignore.
   */
  prefills: boolean;
};

export function chatChannels(whatsappNumber: string, message?: string): ChatChannel[] {
  const instagramHandle = process.env.NEXT_PUBLIC_INSTAGRAM_HANDLE ?? "Nitchiani.shop";
  const text = message ? `?text=${encodeURIComponent(message)}` : "";
  return [
    {
      key: "whatsapp",
      href: `https://wa.me/${whatsappNumber}${text}`,
      label: "WhatsApp",
      prefills: true,
    },
    {
      key: "instagram",
      href: `https://ig.me/m/${instagramHandle}`,
      label: "Instagram",
      prefills: false,
    },
    {
      key: "facebook",
      href: `https://m.me/${BUSINESS.facebookPageId}`,
      label: "Facebook",
      prefills: false,
    },
  ];
}
