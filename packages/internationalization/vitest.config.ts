import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    name: "internationalization",
    environment: "node",
    globals: true,
    include: ["src/**/*.test.ts"],
  },
});
