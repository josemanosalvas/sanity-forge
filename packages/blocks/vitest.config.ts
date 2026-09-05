import path from "node:path";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

const root = import.meta.dirname;
const mock = (file: string) => path.resolve(root, "src/internal/testing", file);

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      {
        find: "lucide-react/dynamic",
        replacement: mock("lucide-react-dynamic.mock.tsx"),
      },
      { find: "lucide-react", replacement: mock("lucide-react.mock.tsx") },
      { find: "next/link", replacement: mock("next-link.mock.tsx") },
    ],
  },
  test: {
    name: "blocks",
    environment: "node",
    globals: true,
    css: false,
    setupFiles: ["./vitest.setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    env: {
      NEXT_PUBLIC_SANITY_PROJECT_ID: "test-project-id",
      NEXT_PUBLIC_SANITY_DATASET: "production",
    },
  },
});
