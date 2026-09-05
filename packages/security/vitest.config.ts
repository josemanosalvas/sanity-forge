import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    name: "security",
    environment: "node",
    globals: true,
    include: ["**/*.test.ts"],
  },
});
