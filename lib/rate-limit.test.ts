import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { __resetRateLimit, clientIp, rateLimit } from "./rate-limit";

describe("rateLimit", () => {
  beforeEach(() => {
    __resetRateLimit();
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("allows up to the limit then blocks", () => {
    const opts = { limit: 3, windowMs: 60_000 };
    expect(rateLimit("ip-a", opts).ok).toBe(true); // 1
    expect(rateLimit("ip-a", opts).ok).toBe(true); // 2
    expect(rateLimit("ip-a", opts).ok).toBe(true); // 3
    const blocked = rateLimit("ip-a", opts); // 4
    expect(blocked.ok).toBe(false);
    expect(blocked.remaining).toBe(0);
    expect(blocked.retryAfter).toBeGreaterThan(0);
  });

  it("tracks keys independently", () => {
    const opts = { limit: 1, windowMs: 60_000 };
    expect(rateLimit("ip-a", opts).ok).toBe(true);
    expect(rateLimit("ip-a", opts).ok).toBe(false);
    expect(rateLimit("ip-b", opts).ok).toBe(true); // different key, own window
  });

  it("resets after the window elapses", () => {
    const opts = { limit: 1, windowMs: 1_000 };
    expect(rateLimit("ip-a", opts).ok).toBe(true);
    expect(rateLimit("ip-a", opts).ok).toBe(false);
    vi.advanceTimersByTime(1_001);
    expect(rateLimit("ip-a", opts).ok).toBe(true); // fresh window
  });

  it("reports remaining count while under the limit", () => {
    const opts = { limit: 5, windowMs: 60_000 };
    expect(rateLimit("ip-c", opts).remaining).toBe(4);
    expect(rateLimit("ip-c", opts).remaining).toBe(3);
  });
});

describe("clientIp", () => {
  it("prefers the first x-forwarded-for entry", () => {
    const req = new Request("https://x.test", {
      headers: { "x-forwarded-for": "203.0.113.7, 70.41.3.18" },
    });
    expect(clientIp(req)).toBe("203.0.113.7");
  });

  it("falls back to x-real-ip then a constant", () => {
    const withReal = new Request("https://x.test", {
      headers: { "x-real-ip": "198.51.100.2" },
    });
    expect(clientIp(withReal)).toBe("198.51.100.2");
    expect(clientIp(new Request("https://x.test"))).toBe("0.0.0.0");
  });
});
