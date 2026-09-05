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
  rules: {
    // Sanity schema definitions and Next.js config objects carry semantic key
    // order (name, type, title, ...). Alphabetical sorting would hurt them.
    "sort-keys": "off",
    // Both function declarations and arrow functions are idiomatic in the
    // Next.js, React and Sanity ecosystems this template builds on.
    "func-style": "off",
    "react/function-component-definition": "off",
    // Unicode regex mode and named groups change nothing for the simple
    // patterns used here; keeping them off avoids churn in ported code.
    "require-unicode-regexp": "off",
    "prefer-named-capture-group": "off",
    "no-inline-comments": "off",
    // `reduce` and `++` are idiomatic in the serializers and loops this
    // template ports; banning them buys nothing but rewrites.
    "unicorn/no-array-reduce": "off",
    "no-plusplus": "off",
    // Its autofix strips explicit `undefined` arguments, which breaks calls
    // to functions whose parameters are required.
    "unicorn/no-useless-undefined": "off",
    // Function declarations hoist; mutual recursion between serializers is
    // clearer than forcing a specific order.
    "no-use-before-define": [
      "error",
      { functions: false, classes: true, variables: true },
    ],
    // Per-block `index.ts` barrels are the documented public surface of a
    // block; consumers still reach individual files through subpath exports.
    "oxc/no-barrel-file": "off",
  },
  overrides: [
    {
      files: ["**/*.test.ts", "**/*.test.tsx"],
      plugins: ["vitest"],
      rules: {
        // Focused test files without a wrapping describe are fine; expect
        // counts are a property of the behaviour under test, not a limit.
        "vitest/require-top-level-describe": "off",
        "vitest/max-expects": "off",
      },
    },
    {
      files: ["**/*.stories.tsx"],
      rules: {
        // Storybook's CSF convention is a default export per story file.
        "import/no-default-export": "off",
      },
    },
  ],
});
