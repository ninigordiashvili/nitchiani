/**
 * EchoDesk numbers orders `ORD-20260930-W1WI7P`: a prefix, the date, and a random code. The
 * whole thing is what EchoDesk's dashboard shows and searches by, so it is kept intact; but a
 * shopper only needs the code to tell us which order they mean, and the date reads better as
 * a date. This splits the number for display.
 */
export type OrderNumberParts = {
  /** The short, memorable part — "W1WI7P". The whole number when it isn't in the usual form. */
  code: string;
  /** The order date written into the number, when there is one. */
  date: Date | null;
  /** The number exactly as EchoDesk has it — what to copy and what support can search. */
  full: string;
};

const PATTERN = /^ORD-(\d{4})(\d{2})(\d{2})-([A-Z0-9]+)$/i;

export function parseOrderNumber(full: string): OrderNumberParts {
  const m = PATTERN.exec(full.trim());
  if (!m) return { code: full.trim(), date: null, full: full.trim() };
  const [, y, mo, d, code] = m;
  const date = new Date(Number(y), Number(mo) - 1, Number(d));
  const valid = date.getFullYear() === Number(y) && date.getMonth() === Number(mo) - 1;
  return { code: code.toUpperCase(), date: valid ? date : null, full: full.trim() };
}
