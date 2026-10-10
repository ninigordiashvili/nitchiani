import { describe, expect, it } from "vitest";
import { scoreForQuery } from "./match";

const bonnet = {
  title: "ატლასის ქუდი თმისთვის — ყავისფერი",
  // What `adaptProduct` builds: both names, the slug, the category and its aliases.
  searchText:
    "ატლასის ქუდი თმისთვის — ყავისფერი satin bonnet for hair brown " +
    "satin bonnet for hair brown bonnets ბონეტ ქუდ ატლას bonnet cap satin",
  shortDescription: "შეინარჩუნე ვარცხნილობა ღამით.",
  description: "ატლასის ქუდი, რომელიც იცავს თმას.",
} as never;

const hair = {
  title: "ღრმა ტალღოვანი თმის დაგრძელება",
  searchText: "ღრმა ტალღოვანი თმის დაგრძელება deep wave braiding hair hair-extensions თმა braid",
  shortDescription: "ბონეტი ცალკე იყიდება.",
  description: "ნაწნავებისთვის.",
} as never;

describe("scoreForQuery", () => {
  it("finds a product by the other language's word", () => {
    // The whole point: the Georgian site is browsed by people who type "bonnet".
    expect(scoreForQuery(bonnet, "bonnet")).toBe(2);
    expect(scoreForQuery(bonnet, "satin")).toBe(2);
  });

  it("matches an inflected Georgian query against the indexed stem", () => {
    // Typed "ბონეტი"/"ბონეტები", indexed "ბონეტ".
    expect(scoreForQuery(bonnet, "ბონეტი")).toBe(2);
    expect(scoreForQuery(bonnet, "ბონეტები")).toBe(2);
  });

  it("ranks a name match above a passing mention in the copy", () => {
    // The braiding hair says "bonnet sold separately"; it must not outrank a bonnet.
    expect(scoreForQuery(hair, "ბონეტი")).toBe(1);
    expect(scoreForQuery(bonnet, "ბონეტი")).toBeGreaterThan(scoreForQuery(hair, "ბონეტი"));
  });

  it("says no to a word the catalogue doesn't carry", () => {
    expect(scoreForQuery(bonnet, "ჩანთა")).toBe(0);
    expect(scoreForQuery(bonnet, "")).toBe(0);
  });

  it("does not let a short query prefix-match everything", () => {
    // "ატ" is a prefix of "ატლასის" but under the four-character floor, so only a real
    // substring hit counts — and that one is genuine.
    expect(scoreForQuery(hair, "ატ")).toBe(0);
  });
});
