import { describe, expect, it } from "vitest";
import { metaDescription } from "./seo";

describe("metaDescription", () => {
  it("returns short text untouched", () => {
    expect(metaDescription("Short enough.")).toBe("Short enough.");
  });

  it("keeps whole sentences while they fit", () => {
    const text = "First sentence here. Second sentence here. Third sentence here.";
    expect(metaDescription(text, 45)).toBe("First sentence here. Second sentence here.");
  });

  it("prefers a word-boundary trim when whole sentences barely fill the budget", () => {
    // A short opener followed by a long second sentence would otherwise yield the opener
    // alone — a fraction of the space Google gives us.
    // The whole thing must exceed the limit, or it is returned untouched and nothing is tested.
    const text =
      "Short opener. Then a considerably longer second sentence that runs well past the budget " +
      "and therefore cannot be kept whole under any circumstances.";
    const out = metaDescription(text, 100);
    expect(out.length).toBeGreaterThan(60);
    expect(out.endsWith("…")).toBe(true);
  });

  it("never exceeds the limit", () => {
    const text = "a".repeat(40) + ". " + "b".repeat(40) + ". " + "c".repeat(400);
    expect(metaDescription(text, 100).length).toBeLessThanOrEqual(100);
  });

  it("trims at a word boundary when the first sentence alone is too long", () => {
    // No sentence fits, so the fallback runs — and it must not sever a word. Checking the
    // last character is not enough (a whole word also ends in a word character); what makes
    // the cut clean is that the source continues with a space right where we stopped.
    const source = "one two three four five six seven eight nine ten";
    const out = metaDescription(source, 20);
    expect(out.endsWith("…")).toBe(true);
    const kept = out.slice(0, -1);
    expect(source.startsWith(kept)).toBe(true);
    expect(source[kept.length]).toBe(" ");
    expect(out.length).toBeLessThanOrEqual(21);
  });

  it("collapses whitespace, so wrapped source copy doesn't leak newlines", () => {
    expect(metaDescription("one\n  two\t three")).toBe("one two three");
  });

  it("handles Georgian sentences", () => {
    const ka = "ხელოვნური თმა ნაწნავებისთვის. თითოეულ შეკვრაში 3 ცალია. სიგრძე 20-დან 28 დუიმამდე.";
    const out = metaDescription(ka, 60);
    expect(out.length).toBeLessThanOrEqual(60);
    expect(out).toContain("ხელოვნური თმა");
  });
});
