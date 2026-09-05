import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    name: "seo",
    environment: "node",
    globals: true,
    include: ["src/**/*.test.ts"],
  },
});
