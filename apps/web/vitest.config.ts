import path from "node:path";

import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: { "@": path.resolve(import.meta.dirname, "src") },
  },
  test: {
    name: "web",
    environment: "node",
    globals: true,
    include: ["src/**/*.test.ts"],
    // Validated for real (no SKIP_ENV_VALIDATION) so defaults such as the
    // Studio URL apply exactly as they do at runtime.
    env: {
      NEXT_PUBLIC_SANITY_PROJECT_ID: "test",
      NEXT_PUBLIC_SANITY_DATASET: "production",
    },
  },
});
