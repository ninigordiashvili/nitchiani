import { afterEach, describe, expect, it, vi } from "vitest";

const KEY = "nitchiani:cookie-consent";

async function load(metaOn: boolean, record: Record<string, unknown> | null) {
  vi.resetModules();
  vi.stubEnv("NEXT_PUBLIC_META_PIXEL_ENABLED", metaOn ? "true" : "");
  const store = new Map<string, string>();
  if (record) store.set(KEY, JSON.stringify({ decidedAt: new Date().toISOString(), ...record }));
  const localStorage = { getItem: (k: string) => store.get(k) ?? null };
  vi.stubGlobal("localStorage", localStorage);
  vi.stubGlobal("window", { localStorage });
  return import("./cookie-consent");
}
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("consent versioning", () => {
  it("keeps an old answer valid while the pixel is off", async () => {
    const m = await load(false, { decision: "accepted" });
    expect(m.hasAnalyticsConsent()).toBe(true);
  });

  it("treats an old acceptance as no answer once the pixel is on — nothing runs", async () => {
    const m = await load(true, { decision: "accepted" });
    expect(m.CONSENT_VERSION).toBe(2);
    expect(m.hasAnalyticsConsent()).toBe(false);
  });

  it("treats an old rejection as no answer too, so the banner asks again", async () => {
    const m = await load(true, { decision: "rejected" });
    expect(m.hasAnalyticsConsent()).toBe(false);
  });

  it("honours an answer given to the new banner", async () => {
    const m = await load(true, { decision: "accepted", version: 2 });
    expect(m.hasAnalyticsConsent()).toBe(true);
  });

  it("a new visitor has no answer", async () => {
    const m = await load(true, null);
    expect(m.hasAnalyticsConsent()).toBe(false);
  });
});
