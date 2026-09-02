import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const API = "https://nitchiani.api.echodesk.ge";
async function load() {
  vi.resetModules();
  vi.stubEnv("NEXT_PUBLIC_ECHODESK_API_URL", API);
  return import("./promo");
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

describe("validatePromo", () => {
  it("returns the discount for a good code", async () => {
    const { validatePromo } = await load();
    fetchMock.mockResolvedValue(reply({ valid: true, discount_amount: "17.80", message: "ok" }));
    await expect(validatePromo("WELCOME10", 178)).resolves.toMatchObject({
      valid: true,
      discountAmount: 17.8,
    });
    // The subtotal is quoted so the backend can apply minimum-spend rules.
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({
      code: "WELCOME10",
      subtotal: "178.00",
    });
  });

  it("passes EchoDesk's own message through for an unknown code", async () => {
    const { validatePromo } = await load();
    // The exact response the live tenant gives today.
    fetchMock.mockResolvedValue(reply({ valid: false, message: "Promo code not found." }));
    await expect(validatePromo("NOPE", 100)).resolves.toEqual({
      valid: false,
      discountAmount: 0,
      message: "Promo code not found.",
    });
  });

  it("returns null on a backend failure rather than reporting 'invalid'", async () => {
    // Calling a good code invalid would silently charge full price.
    const { validatePromo } = await load();
    fetchMock.mockResolvedValue(reply({}, false));
    await expect(validatePromo("WELCOME10", 100)).resolves.toBeNull();
    fetchMock.mockRejectedValue(new Error("offline"));
    await expect(validatePromo("WELCOME10", 100)).resolves.toBeNull();
  });

  it("treats a blank code as invalid without calling out", async () => {
    const { validatePromo } = await load();
    await expect(validatePromo("   ", 100)).resolves.toEqual({ valid: false });
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
