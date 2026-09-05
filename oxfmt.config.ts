import { defineConfig } from "oxfmt";
import ultracite from "ultracite/oxfmt";

export default defineConfig({
  ...ultracite,
  ignorePatterns: [
    ...ultracite.ignorePatterns,
    "**/.sanity",
    "**/sanity.types.ts",
    "**/schema.json",
    "**/playwright-report",
    "**/test-results",
    "**/*.hbs",
  ],
});
