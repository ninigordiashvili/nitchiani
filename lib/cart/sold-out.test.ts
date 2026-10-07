import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

async function freshModule() {
  vi.resetModules();
  return import("./sold-out");
}

beforeEach(() => {
  const store = new Map<string, string>();
  vi.stubGlobal("sessionStorage", {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, v),
    removeItem: (k: string) => void store.delete(k),
  });
});
afterEach(() => vi.unstubAllGlobals());

describe("sold-out knowledge", () => {
  it("records a handle once, ignoring repeats and blanks", async () => {
    const { markSoldOut } = await freshModule();
    markSoldOut(["ponytail", "", "ponytail"]);
    markSoldOut(["ponytail"]);
    expect(JSON.parse(sessionStorage.getItem("nitchiani:sold-out") as string)).toEqual(["ponytail"]);
  });

  it("remembers across a reload of the same tab", async () => {
    const first = await freshModule();
    first.markSoldOut(["ponytail", "bonnet"]);
    const reloaded = await freshModule();
    reloaded.markSoldOut([]);
    expect(JSON.parse(sessionStorage.getItem("nitchiani:sold-out") as string).sort()).toEqual([
      "bonnet",
      "ponytail",
    ]);
  });

  it("survives storage being unavailable", async () => {
    vi.stubGlobal("sessionStorage", {
      getItem: () => {
        throw new Error("blocked");
      },
      setItem: () => {
        throw new Error("blocked");
      },
    });
    const { markSoldOut } = await freshModule();
    expect(() => markSoldOut(["ponytail"])).not.toThrow();
  });
});
