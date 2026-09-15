import { describe, expect, it } from "vitest";
import { cityName, GEORGIAN_CITIES, searchCities } from "./georgian-cities";

describe("searchCities", () => {
  it("offers the list unfiltered before anything is typed", () => {
    // Focusing the field should show what's on offer, like the address dropdown does.
    expect(searchCities("")).toHaveLength(8);
    expect(searchCities("", 3)).toHaveLength(3);
  });

  it("matches Georgian script", () => {
    expect(searchCities("თბი").map((c) => c.en)).toContain("Tbilisi");
  });

  it("matches Latin script whatever the page language", () => {
    // A Georgian speaker on an English keyboard types "bat" and means ბათუმი.
    expect(searchCities("bat").map((c) => c.ka)).toContain("ბათუმი");
  });

  it("is case-insensitive and ignores surrounding space", () => {
    expect(searchCities("  KUTAISI ").map((c) => c.en)).toEqual(["Kutaisi"]);
  });

  it("ranks a prefix hit above an interior one", () => {
    // "oni" starts Oni and sits inside Zestafoni — the short exact one has to win, or the
    // shopper picks the first row and gets the wrong city.
    const names = searchCities("oni").map((c) => c.en);
    expect(names[0]).toBe("Oni");
  });

  it("returns nothing for a place not on the list", () => {
    // Villages aren't here by design; the picker keeps whatever was typed.
    expect(searchCities("არყისმანი")).toEqual([]);
  });

  it("honours the limit", () => {
    expect(searchCities("a", 3).length).toBeLessThanOrEqual(3);
  });
});

describe("cityName", () => {
  it("returns the Georgian name for ka and Latin for en", () => {
    const tbilisi = GEORGIAN_CITIES[0];
    expect(cityName(tbilisi, "ka")).toBe("თბილისი");
    expect(cityName(tbilisi, "en")).toBe("Tbilisi");
  });
});

describe("the list itself", () => {
  it("has no duplicates", () => {
    const en = GEORGIAN_CITIES.map((c) => c.en);
    expect(new Set(en).size).toBe(en.length);
    const ka = GEORGIAN_CITIES.map((c) => c.ka);
    expect(new Set(ka).size).toBe(ka.length);
  });

  it("carries both names for every entry", () => {
    for (const c of GEORGIAN_CITIES) {
      expect(c.ka).not.toBe("");
      expect(c.en).not.toBe("");
    }
  });

  it("leads with Tbilisi, the shop's own city and the commonest answer", () => {
    // First in the list, so it heads the dropdown on an empty field. Not a default value:
    // the form pre-fills nothing.
    expect(GEORGIAN_CITIES[0].en).toBe("Tbilisi");
  });

  it("omits occupied territories the shop cannot deliver to", () => {
    const names = GEORGIAN_CITIES.flatMap((c) => [c.en, c.ka]);
    for (const off of ["Sukhumi", "Tskhinvali", "სოხუმი", "ცხინვალი", "Gagra", "გაგრა"]) {
      expect(names).not.toContain(off);
    }
  });
});
