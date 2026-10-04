import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["*.test.ts", "functions/**/*.test.ts"],
    name: "blueprint",
  },
});
