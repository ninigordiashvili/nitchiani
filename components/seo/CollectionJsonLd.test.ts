import { describe, expect, it } from "vitest";
import { collectionJsonLd } from "./CollectionJsonLd";

describe("collectionJsonLd", () => {
  it("lists products in order with absolute URLs", () => {
    const d = collectionJsonLd({
      locale: "ka",
      path: "/shop/durags",
      name: "Durags",
      products: [
        { handle: "a", title: "A" },
        { handle: "b", title: "B" },
      ],
    });
    const items = d.mainEntity.itemListElement;
    expect(d["@type"]).toBe("CollectionPage");
    expect(d.mainEntity.numberOfItems).toBe(2);
    expect(items[1]).toMatchObject({ position: 2, name: "B" });
    expect(items[0].url).toMatch(/^https?:\/\/.+\/ka\/products\/a$/);
  });
});
