import { afterEach, describe, expect, it, vi } from "vitest";

/**
 * The API ignores `?slug=` and answers with its first page, so a product beyond that page
 * was reported as missing and its page 404'd. The lookup must read the whole list.
 */
describe("getProductBySlug", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("finds a product that is not on the API's first page", async () => {
    vi.stubEnv("NEXT_PUBLIC_ECHODESK_API_URL", "https://example.test");
    const all = Array.from({ length: 23 }, (_, i) => ({ id: i + 1, slug: `p-${i + 1}` }));
    const fetchMock = vi.fn(async (url: string) => {
      const u = String(url);
      // The list ignores `slug` and honours `page_size`, as the real API does.
      if (u.includes("/products/?")) {
        const size = Number(new URL(u).searchParams.get("page_size") ?? 20);
        const results = all.slice(0, size);
        return new Response(JSON.stringify({ count: all.length, results }));
      }
      const id = Number(u.match(/products\/(\d+)\//)?.[1]);
      return new Response(JSON.stringify(all.find((p) => p.id === id)));
    });
    vi.stubGlobal("fetch", fetchMock);

    const { getProductBySlug } = await import("./client");
    const found = await getProductBySlug("p-23");
    expect(found?.slug).toBe("p-23");
  });
});
