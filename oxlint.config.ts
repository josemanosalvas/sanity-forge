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
  // Design-system rules are opt-in: add `shadcn/*` rules to `rules`.
  // See https://github.com/shadcn-ui/lint#rules
  jsPlugins: ["@shadcn/lint"],
  settings: {
    shadcn: {
      // Apps and blocks import the shared components through package exports.
      ui: "@repo/ui/components",
    },
  },
});
