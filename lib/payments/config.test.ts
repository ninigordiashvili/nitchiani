import { afterEach, describe, expect, it, vi } from "vitest";

async function problemsWith(env: Record<string, string | undefined>) {
  vi.resetModules();
  for (const [k, v] of Object.entries(env)) {
    if (v === undefined) vi.stubEnv(k, "");
    else vi.stubEnv(k, v);
  }
  const { findPaymentConfigProblems } = await import("./config");
  return findPaymentConfigProblems();
}

afterEach(() => vi.unstubAllEnvs());

describe("payment config", () => {
  it("flags TBC switched on without credentials — the trap that strands a shopper", async () => {
    const problems = await problemsWith({
      NEXT_PUBLIC_TBC_ENABLED: "true",
      TBC_API_KEY: "",
      TBC_CLIENT_ID: "",
      TBC_CLIENT_SECRET: "",
    });
    expect(problems).toHaveLength(1);
    expect(problems[0].method).toBe("tbc_card");
    expect(problems[0].missing).toEqual(["TBC_API_KEY", "TBC_CLIENT_ID", "TBC_CLIENT_SECRET"]);
  });

  it("names only the credentials that are actually absent", async () => {
    const problems = await problemsWith({
      NEXT_PUBLIC_TBC_ENABLED: "true",
      TBC_API_KEY: "key",
      TBC_CLIENT_ID: "id",
      TBC_CLIENT_SECRET: "",
    });
    expect(problems[0].missing).toEqual(["TBC_CLIENT_SECRET"]);
  });

  it("stays quiet when TBC is fully configured", async () => {
    const problems = await problemsWith({
      NEXT_PUBLIC_TBC_ENABLED: "true",
      TBC_API_KEY: "key",
      TBC_CLIENT_ID: "id",
      TBC_CLIENT_SECRET: "secret",
    });
    expect(problems).toEqual([]);
  });

  it("stays quiet when the method is simply switched off", async () => {
    const problems = await problemsWith({
      NEXT_PUBLIC_TBC_ENABLED: "false",
      NEXT_PUBLIC_BOG_ENABLED: "false",
    });
    expect(problems).toEqual([]);
  });

  it("flags BOG the same way", async () => {
    const problems = await problemsWith({
      NEXT_PUBLIC_BOG_ENABLED: "true",
      BOG_CLIENT_ID: "",
      BOG_CLIENT_SECRET: "",
    });
    expect(problems.map((p) => p.method)).toContain("bog_card");
  });
});

describe("with EchoDesk as the backend", () => {
  it("stops warning about our own gateway credentials", async () => {
    // EchoDesk brokers the charge and hands back a payment_url, so BOG/TBC secrets are
    // never read. Warning about them would be a permanent false alarm.
    const problems = await problemsWith({
      NEXT_PUBLIC_ECHODESK_API_URL: "https://nitchiani.api.echodesk.ge",
      NEXT_PUBLIC_BOG_ENABLED: "true",
      NEXT_PUBLIC_TBC_ENABLED: "true",
      BOG_CLIENT_ID: "",
      TBC_API_KEY: "",
    });
    expect(problems).toEqual([]);
  });
});
