import path from "node:path";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

const root = import.meta.dirname;
const mock = (file: string) => path.resolve(root, "src/testing", file);

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      {
        find: "lucide-react/dynamic",
        replacement: mock("lucide-react-dynamic.mock.tsx"),
      },
      { find: "next/link", replacement: mock("next-link.mock.tsx") },
    ],
  },
  test: {
    css: false,
    env: {
      NEXT_PUBLIC_SANITY_DATASET: "production",
      NEXT_PUBLIC_SANITY_PROJECT_ID: "test-project-id",
    },
    environment: "node",
    globals: true,
    include: ["src/**/*.test.{ts,tsx}"],
    name: "blocks",
    setupFiles: ["./vitest.setup.ts"],
  },
});
