import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  // The Studio tsconfig keeps JSX for Sanity's own bundler; tests need it compiled.
  oxc: { jsx: { runtime: "automatic" } },
  test: {
    environment: "node",
    // Studio sources sit at the app root, so the glob has to skip build output.
    exclude: [...configDefaults.exclude, "**/dist/**", "**/.sanity/**"],
    // Tests live beside the modules they cover.
    include: ["**/*.test.{ts,tsx}"],
    name: "studio",
  },
});
