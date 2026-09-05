import { defineConfig } from "oxlint";
import core from "ultracite/oxlint/core";
import next from "ultracite/oxlint/next";
import react from "ultracite/oxlint/react";
import vitest from "ultracite/oxlint/vitest";

export default defineConfig({
  extends: [core, react, next, vitest],
  ignorePatterns: [
    ...core.ignorePatterns,
    "**/.sanity",
    "**/sanity.types.ts",
    "**/schema.json",
    "**/playwright-report",
    "**/test-results",
    "**/*.hbs",
  ],
});
