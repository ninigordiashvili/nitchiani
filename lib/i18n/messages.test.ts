import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import en from "./messages/en.json";
import ka from "./messages/ka.json";

/** Every `t("a.b")` / `t("a")` literal used in the app, with its namespace where declared. */
function usedKeys(): Array<{ file: string; key: string }> {
  const roots = ["app", "components"];
  const out: Array<{ file: string; key: string }> = [];

  const walk = (dir: string) => {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      const p = join(dir, e.name);
      if (e.isDirectory()) walk(p);
      else if (/\.tsx?$/.test(e.name)) {
        const src = readFileSync(p, "utf8");
        // The namespace a file bound, e.g. useTranslations("nav") / getTranslations("cart").
        const ns = [...src.matchAll(/(?:use|get)Translations\(\s*"([^"]+)"\s*\)/g)].map((m) => m[1]);
        for (const m of src.matchAll(/\bt\(\s*"([a-zA-Z][\w.]*)"/g)) {
          const key = m[1];
          if (key.includes(".")) out.push({ file: p, key });
          else for (const n of ns) out.push({ file: p, key: `${n}.${key}` });
        }
      }
    }
  };
  roots.forEach(walk);
  return out;
}

const resolve = (bundle: Record<string, unknown>, path: string) =>
  path.split(".").reduce<unknown>((acc, part) => (acc as Record<string, unknown>)?.[part], bundle);

/**
 * next-intl throws MISSING_MESSAGE at render time, so a key deleted during a refactor only
 * surfaces when someone opens the page it's on. This catches it at test time instead — it was
 * written after `nav.allProductsDesc` was removed as "orphaned" and broke /shop.
 */
/**
 * Known gap, recorded rather than silently tolerated: `components/booking/
 * WhatsAppBookingForm.tsx` is not rendered anywhere and its whole `booking` namespace is
 * empty — 11 keys. It can't break a page today because nothing mounts it, but it would the
 * moment someone did. Listed explicitly so this suite still fails on anything new.
 */
const KNOWN_GAPS = [/^(en|ka): booking\./];

describe("i18n messages", () => {
  const keys = usedKeys();

  it("finds translation keys to check", () => {
    expect(keys.length).toBeGreaterThan(50);
  });

  it("resolves every key used in the app, in both locales", () => {
    const missing: string[] = [];
    for (const { file, key } of keys) {
      // A file may bind several namespaces; the key only has to resolve in one of them.
      const sameKey = keys.filter((k) => k.file === file && k.key.split(".").pop() === key.split(".").pop());
      const resolvesEn = sameKey.some((k) => resolve(en, k.key) !== undefined);
      const resolvesKa = sameKey.some((k) => resolve(ka, k.key) !== undefined);
      if (!resolvesEn) missing.push(`en: ${key} (${file})`);
      if (!resolvesKa) missing.push(`ka: ${key} (${file})`);
    }
    const unexpected = [...new Set(missing)].filter((m) => !KNOWN_GAPS.some((r) => r.test(m)));
    expect(unexpected).toEqual([]);
  });

  it("keeps en and ka structurally identical", () => {
    const paths = (o: unknown, prefix = ""): string[] =>
      typeof o === "object" && o !== null && !Array.isArray(o)
        ? Object.entries(o).flatMap(([k, v]) => paths(v, prefix ? `${prefix}.${k}` : k))
        : [prefix];
    const a = new Set(paths(en));
    const b = new Set(paths(ka));
    expect({ missingInKa: [...a].filter((k) => !b.has(k)), missingInEn: [...b].filter((k) => !a.has(k)) })
      .toEqual({ missingInKa: [], missingInEn: [] });
  });
});
