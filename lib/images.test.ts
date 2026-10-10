import { describe, expect, it } from "vitest";
import { distinctImages, variantForPhoto, variantPhotos } from "./images";

const img = (url: string) => ({ url, altText: url });

describe("distinctImages", () => {
  it("collapses a placeholder gallery of one repeated shot to a single entry", () => {
    const gallery = Array.from({ length: 5 }, () => img("/products/silk-bonnet-noir.png"));
    // The quick-view strip gates on length > 1, so this is what keeps it hidden today.
    expect(distinctImages(gallery)).toHaveLength(1);
  });

  it("keeps genuinely different shots, in first-appearance order", () => {
    const gallery = [img("/a.png"), img("/b.png"), img("/a.png"), img("/c.png")];
    expect(distinctImages(gallery).map((i) => i.url)).toEqual(["/a.png", "/b.png", "/c.png"]);
  });

  it("handles empty and single-image galleries", () => {
    expect(distinctImages([])).toEqual([]);
    expect(distinctImages([img("/a.png")])).toHaveLength(1);
  });
});

describe("variantPhotos", () => {
  const product = (variants: unknown[]) => ({ variants }) as never;

  it("lists only the variants that have a photo, in variant order", () => {
    expect(
      variantPhotos(
        product([
          { image: img("/black.png") },
          {},
          { image: img("/blonde.png") },
          { image: { url: "", altText: "" } },
        ]),
      ),
    ).toEqual([img("/black.png"), img("/blonde.png")]);
  });
});

describe("variantForPhoto", () => {
  const variants = [
    { id: "a", image: img("/black.png"), availableForSale: true },
    { id: "b", image: img("/blonde.png"), availableForSale: false },
    { id: "c", availableForSale: true },
  ] as never;

  it("names the variant whose photo is on screen", () => {
    expect(variantForPhoto(variants, "/black.png")).toMatchObject({ id: "a" });
  });

  it("leaves the choice alone for a shot that belongs to no variant, or to none for sale", () => {
    // A plain gallery shot: the shopper is just looking around.
    expect(variantForPhoto(variants, "/pack-shot.png")).toBeUndefined();
    // Sold out — the picker greys this one out, so the photo must not select it either.
    expect(variantForPhoto(variants, "/blonde.png")).toBeUndefined();
    expect(variantForPhoto(variants, null)).toBeUndefined();
  });
});
