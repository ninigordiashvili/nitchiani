/**
 * Municipal centres of Georgia, for the checkout city field.
 *
 * A static list rather than a Places lookup: the set is small, it does not change, and a
 * city field that costs an API call per keystroke is the wrong trade when the answer is
 * almost always one of fifty words. The address field above already does the Places work,
 * and picking a suggestion there fills this field on its own — this list is for the
 * customer who types the address by hand, which in Tbilisi is most of them.
 *
 * Deliberately NOT a closed set. `CityPicker` suggests from this list but accepts anything
 * typed, because villages and settlements are not here and refusing an order over a place
 * name we failed to anticipate would be absurd.
 *
 * Occupied territories (Abkhazia, Tskhinvali region) are omitted: the shop cannot deliver
 * there, and offering the name only to fail later is worse than not offering it.
 */
export type GeorgianCity = { ka: string; en: string };

export const GEORGIAN_CITIES: GeorgianCity[] = [
  { ka: "თბილისი", en: "Tbilisi" },
  { ka: "ბათუმი", en: "Batumi" },
  { ka: "ქუთაისი", en: "Kutaisi" },
  { ka: "რუსთავი", en: "Rustavi" },
  { ka: "გორი", en: "Gori" },
  { ka: "ზუგდიდი", en: "Zugdidi" },
  { ka: "ფოთი", en: "Poti" },
  { ka: "ქობულეთი", en: "Kobuleti" },
  { ka: "ხაშური", en: "Khashuri" },
  { ka: "სამტრედია", en: "Samtredia" },
  { ka: "სენაკი", en: "Senaki" },
  { ka: "ზესტაფონი", en: "Zestafoni" },
  { ka: "მარნეული", en: "Marneuli" },
  { ka: "თელავი", en: "Telavi" },
  { ka: "ახალციხე", en: "Akhaltsikhe" },
  { ka: "ოზურგეთი", en: "Ozurgeti" },
  { ka: "კასპი", en: "Kaspi" },
  { ka: "ჭიათურა", en: "Chiatura" },
  { ka: "წყალტუბო", en: "Tskaltubo" },
  { ka: "საგარეჯო", en: "Sagarejo" },
  { ka: "გარდაბანი", en: "Gardabani" },
  { ka: "ბორჯომი", en: "Borjomi" },
  { ka: "ტყიბული", en: "Tkibuli" },
  { ka: "ხონი", en: "Khoni" },
  { ka: "ბოლნისი", en: "Bolnisi" },
  { ka: "ახალქალაქი", en: "Akhalkalaki" },
  { ka: "გურჯაანი", en: "Gurjaani" },
  { ka: "მცხეთა", en: "Mtskheta" },
  { ka: "ყვარელი", en: "Kvareli" },
  { ka: "ახმეტა", en: "Akhmeta" },
  { ka: "ქარელი", en: "Kareli" },
  { ka: "ლანჩხუთი", en: "Lanchkhuti" },
  { ka: "დედოფლისწყარო", en: "Dedoplistskaro" },
  { ka: "საჩხერე", en: "Sachkhere" },
  { ka: "ლაგოდეხი", en: "Lagodekhi" },
  { ka: "ნინოწმინდა", en: "Ninotsminda" },
  { ka: "აბაშა", en: "Abasha" },
  { ka: "წნორი", en: "Tsnori" },
  { ka: "თერჯოლა", en: "Terjola" },
  { ka: "მარტვილი", en: "Martvili" },
  { ka: "ჯვარი", en: "Jvari" },
  { ka: "ვანი", en: "Vani" },
  { ka: "ბაღდათი", en: "Baghdati" },
  { ka: "სიღნაღი", en: "Sighnaghi" },
  { ka: "სტეფანწმინდა", en: "Stepantsminda" },
  { ka: "მესტია", en: "Mestia" },
  { ka: "ამბროლაური", en: "Ambrolauri" },
  { ka: "ონი", en: "Oni" },
  { ka: "ცაგერი", en: "Tsageri" },
  { ka: "დუშეთი", en: "Dusheti" },
  { ka: "თიანეთი", en: "Tianeti" },
  { ka: "ხობი", en: "Khobi" },
  { ka: "წალენჯიხა", en: "Tsalenjikha" },
  { ka: "ჩხოროწყუ", en: "Chkhorotsku" },
  { ka: "ხულო", en: "Khulo" },
  { ka: "ხელვაჩაური", en: "Khelvachauri" },
  { ka: "შუახევი", en: "Shuakhevi" },
  { ka: "ქედა", en: "Keda" },
  { ka: "დმანისი", en: "Dmanisi" },
  { ka: "თეთრიწყარო", en: "Tetritskaro" },
  { ka: "წალკა", en: "Tsalka" },
  { ka: "ადიგენი", en: "Adigeni" },
  { ka: "ასპინძა", en: "Aspindza" },
  { ka: "ვალე", en: "Vale" },
  { ka: "ჩოხატაური", en: "Chokhatauri" },
  { ka: "ხარაგაული", en: "Kharagauli" },
  { ka: "სურამი", en: "Surami" },
  { ka: "ბაკურიანი", en: "Bakuriani" },
  { ka: "გუდაური", en: "Gudauri" },
];

/** The name to show and store for a locale. */
export function cityName(city: GeorgianCity, locale: string): string {
  return locale === "en" ? city.en : city.ka;
}

/**
 * Cities matching `query`, best-first.
 *
 * Both scripts are searched whatever the page language: a Georgian speaker on a Georgian
 * keyboard types "თბი", the same person on a laptop set to English types "tbi", and both
 * mean Tbilisi. Prefix matches rank above interior ones so "ონი" offers Oni before
 * Zestafoni.
 *
 * An empty query returns the whole list — focusing the field should show what is on offer,
 * the way the address field opens its dropdown before you type.
 */
export function searchCities(query: string, limit = 8): GeorgianCity[] {
  const q = query.trim().toLowerCase();
  if (!q) return GEORGIAN_CITIES.slice(0, limit);

  const scored: { city: GeorgianCity; rank: number }[] = [];
  for (const city of GEORGIAN_CITIES) {
    const fields = [city.ka.toLowerCase(), city.en.toLowerCase()];
    let best = -1;
    for (const f of fields) {
      const at = f.indexOf(q);
      if (at === -1) continue;
      // 0 for a prefix hit, 1 for anything further in — never widen past that, or a long
      // name that happens to contain the query would outrank an exact short one.
      const rank = at === 0 ? 0 : 1;
      if (best === -1 || rank < best) best = rank;
    }
    if (best !== -1) scored.push({ city, rank: best });
  }
  scored.sort((a, b) => a.rank - b.rank);
  return scored.slice(0, limit).map((s) => s.city);
}
