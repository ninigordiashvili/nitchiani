import { defineConfig } from "vitest/config";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  // Mirror the tsconfig `@/*` → `./*` alias so tests import modules the same way the app does.
  // Trailing-slash key avoids clobbering scoped npm packages (`@calcom/…`, `@hookform/…`).
  resolve: {
    alias: { "@/": `${root}/` },
  },
  test: {
    environment: "node",
    include: ["**/*.test.ts"],
    exclude: ["node_modules/**", ".next/**"],
  },
});
