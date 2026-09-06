import { describe, expect, it } from "vitest";
import { adaptTracking } from "./tracking";

const base = {
  order_number: "ORD-20260902-G5TW6Z",
  created_at: "2026-09-02T17:14:02Z",
  status: "pending",
  payment_status: "pending",
  items: [{ product_name: { en: "Hair wax", ka: "თმის ჟელე" }, quantity: 2 }],
};

const step = (extra: Record<string, unknown>) => adaptTracking({ ...base, ...extra }, "en")?.step;

describe("adaptTracking — timeline step", () => {
  it("is 'order placed' while nothing has happened yet", () => {
    // The real state of a just-created card order: pending, every timestamp null.
    expect(step({})).toBe(1);
  });

  it("does not claim payment is confirmed while it is pending", () => {
    // Telling a customer their unpaid order is paid is worse than showing no progress.
    expect(step({ payment_status: "pending", paid_at: null, confirmed_at: null })).toBe(1);
  });

  it("advances to payment confirmed once paid", () => {
    expect(step({ payment_status: "paid" })).toBe(2);
  });

  it("advances to prepared once processing starts", () => {
    expect(step({ payment_status: "paid", processing_at: "2026-09-03T09:00:00Z" })).toBe(3);
  });

  it("advances to on-its-way on dispatch or a tracking number", () => {
    expect(step({ payment_status: "paid", shipped_at: "2026-09-04T09:00:00Z" })).toBe(4);
    expect(step({ tracking_number: "GE123456789" })).toBe(4);
  });

  it("treats a blank tracking number as no tracking", () => {
    // EchoDesk sends "" rather than null before dispatch.
    const t = adaptTracking({ ...base, tracking_number: "", courier_provider: "" }, "en");
    expect(t?.tracking).toBeNull();
    expect(t?.step).toBe(1);
  });
});

describe("adaptTracking — content", () => {
  it("localises item titles", () => {
    expect(adaptTracking(base, "ka")?.lines[0].title).toBe("თმის ჟელე");
    expect(adaptTracking(base, "en")?.lines[0].title).toBe("Hair wax");
  });

  it("carries no customer contact details", () => {
    // Anyone holding the link can read this, so it must expose order progress, not identity.
    const raw = {
      ...base,
      client_details: { full_name: "Track Test", email: "t@example.com", phone_number: "555000111" },
      delivery_address: { address: "1 Test St", city: "Tbilisi" },
    };
    const serialised = JSON.stringify(adaptTracking(raw, "en"));
    expect(serialised).not.toContain("t@example.com");
    expect(serialised).not.toContain("555000111");
    expect(serialised).not.toContain("1 Test St");
  });

  it("returns null for a response that isn't an order", () => {
    expect(adaptTracking({ error: "not_found" }, "en")).toBeNull();
    expect(adaptTracking(null, "en")).toBeNull();
  });
});
