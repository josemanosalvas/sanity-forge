import withBundleAnalyzer from "@next/bundle-analyzer";
import type { NextConfig } from "next";

/**
 * Production-safe Next.js defaults shared by every app in the repository.
 * Application-specific composition (i18n plugin, redirects, cache profiles)
 * stays in each app's `next.config.ts`.
 */
export const baseConfig = {
  // Next 16 caching model: static shells + `'use cache'` boundaries.
  cacheComponents: true,
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 31_536_000,
  },
  logging: {
    fetches: {},
  },
  poweredByHeader: false,
  // Stable in Next 16; needs `babel-plugin-react-compiler` in the app.
  reactCompiler: true,
  reactStrictMode: true,
  typedRoutes: true,
} satisfies NextConfig;

/** `images.remotePatterns` entry for a Sanity project's image CDN. */
export const sanityImageRemotePattern = (projectId: string) =>
  ({
    hostname: "cdn.sanity.io",
    pathname: `/images/${projectId}/**`,
    protocol: "https",
  }) as const;

/**
 * Merges app overrides into the shared defaults. Nested objects that apps
 * commonly extend (`images`, `experimental`, `cacheLife`) merge one level deep.
 */
export const createNextConfig = (overrides: NextConfig = {}): NextConfig => ({
  ...baseConfig,
  ...overrides,
  cacheLife: { ...overrides.cacheLife },
  experimental: { ...overrides.experimental },
  images: { ...baseConfig.images, ...overrides.images },
});

/** Wraps a config with `@next/bundle-analyzer`; enable with `ANALYZE=true`. */
export const withAnalyzer = (config: NextConfig): NextConfig =>
  withBundleAnalyzer({ enabled: process.env.ANALYZE === "true" })(config);
