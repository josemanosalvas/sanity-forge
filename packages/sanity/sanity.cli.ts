import { defineCliConfig } from "sanity/cli";

/**
 * This package is a Sanity "app root" for TypeGen only: the Studio extracts
 * `schema.json`, and this config turns that schema plus every `defineQuery`
 * in the monorepo into `src/sanity.types.ts`.
 */
export default defineCliConfig({
  api: {
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production",
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "",
  },
  typegen: {
    formatGeneratedCode: true,
    generates: "./src/sanity.types.ts",
    overloadClientMethods: true,
    path: [
      "./src/**/*.{ts,tsx}",
      "../blocks/src/**/*.{ts,tsx}",
      "../../apps/web/src/**/*.{ts,tsx}",
    ],
    schema: "../../apps/studio/schema.json",
  },
});
