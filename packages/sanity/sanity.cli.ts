import { defineCliConfig } from "sanity/cli";

/**
 * This package is a Sanity "app root" for TypeGen only: the Studio extracts
 * `schema.json`, and this config turns that schema plus every `defineQuery`
 * in the monorepo into `src/sanity.types.ts`.
 */
export default defineCliConfig({
  api: {
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "",
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production",
  },
  typegen: {
    path: [
      "./src/**/*.{ts,tsx}",
      "../blocks/src/**/*.{ts,tsx}",
      "../../apps/web/src/**/*.{ts,tsx}",
    ],
    schema: "../../apps/studio/schema.json",
    generates: "./src/sanity.types.ts",
    overloadClientMethods: true,
    formatGeneratedCode: true,
  },
});
