import path from "node:path";

import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    // What `server-only` resolves to in React Server Components, where these modules run.
    alias: {
      "server-only": path.resolve(
        import.meta.dirname,
        "node_modules/server-only/empty.js"
      ),
    },
  },
  // With `cacheComponents`, Next resolves `next-sanity/live` through its `next-js` condition; inline
  // next-sanity so tests run that same `sanityFetch` and can stub `next/cache` underneath it.
  ssr: {
    resolve: {
      conditions: ["next-js", "module", "node", "development|production"],
    },
  },
  test: {
    env: {
      NEXT_PUBLIC_SANITY_DATASET: "production",
      NEXT_PUBLIC_SANITY_PROJECT_ID: "test",
      SANITY_API_READ_TOKEN: "test-viewer-token",
    },
    environment: "node",
    include: ["src/**/*.test.ts"],
    name: "sanity",
    server: { deps: { inline: ["next-sanity"] } },
  },
});
