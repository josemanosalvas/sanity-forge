import { createRequire } from "node:module";
import path from "node:path";

import type { StorybookConfig } from "@storybook/nextjs-vite";
import { mergeConfig } from "vite";

const require = createRequire(import.meta.url);

/**
 * Resolves a package's absolute path. Required in pnpm/Yarn PnP monorepos so
 * Storybook loads addons and frameworks from the workspace, not from a
 * hoisted guess.
 */
const getAbsolutePath = (value: string) =>
  path.dirname(require.resolve(path.join(value, "package.json")));

const config: StorybookConfig = {
  addons: [
    getAbsolutePath("@storybook/addon-docs"),
    getAbsolutePath("@storybook/addon-a11y"),
    getAbsolutePath("@storybook/addon-themes"),
  ],
  framework: {
    name: getAbsolutePath("@storybook/nextjs-vite"),
    options: {},
  },
  staticDirs: ["../public"],
  stories: [
    "../../../packages/ui/**/*.stories.@(ts|tsx)",
    "../../../packages/blocks/src/**/*.stories.@(ts|tsx)",
  ],
  // The block renderers build Sanity CDN URLs from the public project
  // coordinates. Storybook has no project of its own, so any value works;
  // `define` inlines them where t3-env reads `process.env`.
  viteFinal: (viteConfig) =>
    mergeConfig(viteConfig, {
      define: {
        "process.env.NEXT_PUBLIC_SANITY_DATASET": JSON.stringify(
          process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production"
        ),
        "process.env.NEXT_PUBLIC_SANITY_PROJECT_ID": JSON.stringify(
          process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "storybook"
        ),
      },
    }),
};

export default config;
