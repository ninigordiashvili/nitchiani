import { describe, expect, it } from "vitest";
import { decidePolicyNotice } from "./policy-notice-state";

const VERSION = "2026-10-07";

describe("decidePolicyNotice", () => {
  it("shows the notice to a returning visitor who last saw an older version", () => {
    expect(
      decidePolicyNotice({ seen: "2026-05-20", version: VERSION, hasPriorVisit: true }),
    ).toBe("show");
  });

  it("stays silent once the current version has been seen", () => {
    expect(
      decidePolicyNotice({ seen: VERSION, version: VERSION, hasPriorVisit: true }),
    ).toBe("none");
    // A first-time visitor already marked seen in the same session must not then be shown it.
    expect(
      decidePolicyNotice({ seen: VERSION, version: VERSION, hasPriorVisit: false }),
    ).toBe("none");
  });

  it("marks a first-ever visitor as seen without showing them anything", () => {
    // They are reading today's policy. "We changed it" would be a claim about a version
    // they never read, so §12's notice isn't owed to them.
    expect(
      decidePolicyNotice({ seen: null, version: VERSION, hasPriorVisit: false }),
    ).toBe("markSeen");
  });

  it("shows a returning visitor who has no recorded version", () => {
    // The notice shipped after they last visited, so there is nothing stored for them yet —
    // this is the case it exists for.
    expect(
      decidePolicyNotice({ seen: null, version: VERSION, hasPriorVisit: true }),
    ).toBe("show");
  });

  it("does not claim a change when storage was cleared mid-way", () => {
    // An older version recorded but no cookie decision means the decision was wiped and the
    // visitor can't be read reliably. Quietly re-mark rather than assert a change.
    expect(
      decidePolicyNotice({ seen: "2026-05-20", version: VERSION, hasPriorVisit: false }),
    ).toBe("markSeen");
  });

  it("re-shows the notice when the policy date is bumped again", () => {
    const next = "2027-01-15";
    expect(decidePolicyNotice({ seen: VERSION, version: next, hasPriorVisit: true })).toBe(
      "show",
    );
  });
});
