/** Depth marks reported to GA4, in percent. GA's own enhanced-measurement `scroll` covers 90. */
export const SCROLL_MARKS = [25, 50, 75] as const;

/**
 * Percent of the page scrolled, 0-100. A page that fits the window has nothing to scroll and
 * reports 0, so a short page never "reaches" a mark just by being short.
 */
export function scrollPercent(scrollTop: number, scrollHeight: number, viewport: number): number {
  const scrollable = scrollHeight - viewport;
  if (scrollable <= 0) return 0;
  return Math.min(100, Math.max(0, (scrollTop / scrollable) * 100));
}

/** The marks newly crossed at this depth, given the ones already sent for this page view. */
export function newMarks(percent: number, sent: ReadonlySet<number>): number[] {
  return SCROLL_MARKS.filter((m) => percent >= m && !sent.has(m));
}
