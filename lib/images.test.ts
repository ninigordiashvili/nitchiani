import { describe, expect, it } from "vitest";
import { distinctImages, variantPhotos } from "./images";

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
