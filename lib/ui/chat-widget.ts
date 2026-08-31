/**
 * Opening the EchoDesk chat from our own UI.
 *
 * The widget script (`echodesk.ge/widget.js`, loaded in `app/[locale]/layout.tsx`) exposes
 * no public API — it sets only a `window.__echodeskWidgetLoaded` mount guard and injects an
 * unlabelled-by-id launcher. Its `aria-label="Open chat"` is the one stable handle we get,
 * so we click the launcher rather than reaching into the vendor's internals.
 *
 * Because that selector is the vendor's markup, treat a miss as normal rather than an error:
 * the launcher is genuinely absent whenever the widget hasn't mounted — during local dev
 * (the widget is domain-locked to nitchiani.shop, so `origin_allowed` is false on
 * localhost), before the async script finishes, or if it's blocked. Callers are expected to
 * fall back to a real contact channel when this returns false.
 */
const LAUNCHER_SELECTOR = 'button[aria-label="Open chat"]';

export function isChatWidgetReady(): boolean {
  if (typeof document === "undefined") return false;
  return document.querySelector(LAUNCHER_SELECTOR) !== null;
}

/** Returns false when the widget isn't mounted, so the caller can fall back. */
export function openChatWidget(): boolean {
  if (typeof document === "undefined") return false;
  const launcher = document.querySelector<HTMLButtonElement>(LAUNCHER_SELECTOR);
  if (!launcher) return false;
  launcher.click();
  return true;
}
