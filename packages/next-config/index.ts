import withBundleAnalyzer from "@next/bundle-analyzer";
import type { NextConfig } from "next";

/**
 * Production-safe Next.js defaults shared by every app in the repository.
 * Application-specific composition (i18n plugin, redirects, cache profiles)
 * stays in each app's `next.config.ts`.
 */
export const baseConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Next 16 caching model: static shells + `'use cache'` boundaries.
  cacheComponents: true,
  // Stable in Next 16; needs `babel-plugin-react-compiler` in the app.
  reactCompiler: true,
  typedRoutes: true,
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 31_536_000,
  },
  logging: {
    fetches: {},
  },
} satisfies NextConfig;

/** `images.remotePatterns` entry for a Sanity project's image CDN. */
export const sanityImageRemotePattern = (projectId: string) =>
  ({
    protocol: "https",
    hostname: "cdn.sanity.io",
    pathname: `/images/${projectId}/**`,
  }) as const;

/**
 * Merges app overrides into the shared defaults. Nested objects that apps
 * commonly extend (`images`, `experimental`, `cacheLife`) merge one level deep.
 */
export const createNextConfig = (overrides: NextConfig = {}): NextConfig => ({
  ...baseConfig,
  ...overrides,
  images: { ...baseConfig.images, ...overrides.images },
  experimental: { ...overrides.experimental },
  cacheLife: { ...overrides.cacheLife },
});

/** Wraps a config with `@next/bundle-analyzer`; enable with `ANALYZE=true`. */
export const withAnalyzer = (config: NextConfig): NextConfig =>
  withBundleAnalyzer({ enabled: process.env.ANALYZE === "true" })(config);
