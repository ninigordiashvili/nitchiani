import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const API = "https://nitchiani.api.echodesk.ge";
async function load() {
  vi.resetModules();
  vi.stubEnv("NEXT_PUBLIC_ECHODESK_API_URL", API);
  return import("./reviews");
}

let fetchMock: ReturnType<typeof vi.fn>;
beforeEach(() => {
  fetchMock = vi.fn();
  vi.stubGlobal("fetch", fetchMock);
  vi.spyOn(console, "error").mockImplementation(() => {});
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

const reply = (body: unknown, ok = true) =>
  ({ ok, status: ok ? 200 : 500, json: async () => body }) as unknown as Response;

describe("getReviews", () => {
  it("adapts a review and calls the endpoint by numeric product id", async () => {
    const { getReviews } = await load();
    fetchMock.mockResolvedValue(
      reply({
        results: [
          {
            id: 7,
            client_name: "Nino B.",
            rating: 5,
            content: "  Lovely wax.  ",
            created_at: "2026-09-01T10:00:00Z",
          },
        ],
      }),
    );
    await expect(getReviews("gid://echodesk/Product/3")).resolves.toEqual([
      { id: "7", author: "Nino B.", city: "", date: "2026-09-01T10:00:00Z", rating: 5, body: "Lovely wax." },
    ]);
    // The endpoint keys on the numeric id, not the slug.
    expect(fetchMock.mock.calls[0][0]).toContain("/products/3/reviews/");
  });

  it("drops ratings left without words", async () => {
    // The rail renders quotes, so a bare star click has nothing to display. The score still
    // counts — that comes from the product's own average, not from this list.
    const { getReviews } = await load();
    fetchMock.mockResolvedValue(
      reply({ results: [{ id: 1, rating: 4, content: "   " }, { id: 2, rating: 5, content: "Great" }] }),
    );
    const out = await getReviews("gid://echodesk/Product/3");
    expect(out).toHaveLength(1);
    expect(out?.[0].body).toBe("Great");
  });

  it("returns an empty list — not null — when a product has no reviews yet", async () => {
    // The distinction matters: [] means "asked, none exist" and suppresses the sample-data
    // fallback, so invented testimonials can't appear under a real product.
    const { getReviews } = await load();
    fetchMock.mockResolvedValue(reply({ count: 0, results: [] }));
    await expect(getReviews("gid://echodesk/Product/3")).resolves.toEqual([]);
  });

  it("returns null for a non-EchoDesk id or a failed request", async () => {
    const { getReviews } = await load();
    await expect(getReviews("gid://nitchiani/Product/silk-bonnet-noir")).resolves.toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
    fetchMock.mockResolvedValue(reply({}, false));
    await expect(getReviews("gid://echodesk/Product/3")).resolves.toBeNull();
  });
});
