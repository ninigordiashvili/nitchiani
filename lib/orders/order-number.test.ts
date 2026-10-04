import { describe, expect, it } from "vitest";
import { parseOrderNumber } from "./order-number";

describe("parseOrderNumber", () => {
  it("splits EchoDesk's number into the short code and the date", () => {
    const p = parseOrderNumber("ORD-20260930-W1WI7P");
    expect(p.code).toBe("W1WI7P");
    expect(p.full).toBe("ORD-20260930-W1WI7P");
    expect(p.date?.getFullYear()).toBe(2026);
    expect(p.date?.getMonth()).toBe(8);
    expect(p.date?.getDate()).toBe(30);
  });

  it("shows any other number whole, with no date", () => {
    expect(parseOrderNumber("1048")).toEqual({ code: "1048", date: null, full: "1048" });
    expect(parseOrderNumber("ORD-20261340-ABC").date).toBeNull();
  });
});
