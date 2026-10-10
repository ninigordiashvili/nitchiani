import { describe, expect, it } from "vitest";
import { spreadByCategory } from "./spread";

const p = (handle: string, productTypeHandle: string) =>
  ({ handle, productTypeHandle }) as never;

describe("spreadByCategory", () => {
  it("deals one product from each category in turn", () => {
    // The shape the live catalogue arrives in: newest first, and the newest are all one kind.
    const out = spreadByCategory([
      p("hair-1", "hair-extensions"),
      p("hair-2", "hair-extensions"),
      p("hair-3", "hair-extensions"),
      p("durag-1", "durags"),
      p("bonnet-1", "bonnets"),
    ]);
    expect(out.map((x) => x.handle)).toEqual([
      "hair-1",
      "durag-1",
      "bonnet-1",
      "hair-2",
      "hair-3",
    ]);
  });

  it("keeps every product, including the ones with no category", () => {
    const input = [p("a", "bonnets"), p("b", ""), p("c", "bonnets")];
    const out = spreadByCategory(input);
    expect(out).toHaveLength(3);
    expect(new Set(out.map((x) => x.handle))).toEqual(new Set(["a", "b", "c"]));
  });

  it("leaves a single-category catalogue in its original order", () => {
    const input = [p("a", "bonnets"), p("b", "bonnets"), p("c", "bonnets")];
    expect(spreadByCategory(input).map((x) => x.handle)).toEqual(["a", "b", "c"]);
  });
});
