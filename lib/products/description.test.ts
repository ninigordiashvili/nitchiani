import { describe, expect, it } from "vitest";
import { parseDescription } from "./description";

describe("parseDescription", () => {
  it("returns nothing for empty input", () => {
    expect(parseDescription("")).toEqual([]);
    expect(parseDescription("   \n  ")).toEqual([]);
    expect(parseDescription(undefined)).toEqual([]);
  });

  it("keeps prose as one paragraph", () => {
    expect(parseDescription("Synthetic hair for braiding.")).toEqual([
      { kind: "paragraph", text: "Synthetic hair for braiding." },
    ]);
  });

  it("rejoins soft-wrapped lines, because a textarea wraps where the box ends", () => {
    expect(parseDescription("Synthetic hair\nfor braiding.")).toEqual([
      { kind: "paragraph", text: "Synthetic hair for braiding." },
    ]);
  });

  it("splits paragraphs on a blank line", () => {
    const out = parseDescription("First para.\n\nSecond para.");
    expect(out).toEqual([
      { kind: "paragraph", text: "First para." },
      { kind: "paragraph", text: "Second para." },
    ]);
  });

  it("collects bullet lines into one list", () => {
    const out = parseDescription("- Type: ARIEL\n- Weight: 300 g\n- Color: 1B");
    expect(out).toEqual([{ kind: "list", items: ["Type: ARIEL", "Weight: 300 g", "Color: 1B"] }]);
  });

  it("accepts the bullet characters a merchant actually types", () => {
    const out = parseDescription("• one\n* two\n– three\n— four\n- five");
    expect(out).toEqual([{ kind: "list", items: ["one", "two", "three", "four", "five"] }]);
  });

  it("keeps prose and list apart without needing a blank line between them", () => {
    const out = parseDescription("Curly afro braiding material.\n- Weight: 300 g\n- Color: 1B");
    expect(out).toEqual([
      { kind: "paragraph", text: "Curly afro braiding material." },
      { kind: "list", items: ["Weight: 300 g", "Color: 1B"] },
    ]);
  });

  it("returns to prose after a list", () => {
    const out = parseDescription("- one\n- two\n\nClosing note.");
    expect(out).toEqual([
      { kind: "list", items: ["one", "two"] },
      { kind: "paragraph", text: "Closing note." },
    ]);
  });

  it("does not turn a colon in prose into a bullet", () => {
    // The trap a cleverer heuristic falls into: this is one sentence, not a spec row.
    const out = parseDescription("Note: hand wash cold and air dry.");
    expect(out).toEqual([{ kind: "paragraph", text: "Note: hand wash cold and air dry." }]);
  });

  it("handles Georgian text and an em dash used as punctuation", () => {
    // `—` opens a bullet only at the start of a line; mid-sentence it is punctuation.
    const out = parseDescription("ბოჭკო სითბოგამძლეა — უთოს უძლებს.\n- სიგრძე: 22 დუიმი");
    expect(out).toEqual([
      { kind: "paragraph", text: "ბოჭკო სითბოგამძლეა — უთოს უძლებს." },
      { kind: "list", items: ["სიგრძე: 22 დუიმი"] },
    ]);
  });

  it("ignores a lone bullet marker with nothing after it", () => {
    // `-` with no text is a stray keystroke, not an empty list row.
    expect(parseDescription("-")).toEqual([{ kind: "paragraph", text: "-" }]);
  });
});
