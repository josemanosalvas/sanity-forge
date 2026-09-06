import withBundleAnalyzer from "@next/bundle-analyzer";
import type { NextConfig } from "next";

export const baseConfig = {
  // Repositories keep their own AGENTS.md; do not let `next dev` scaffold
  // another one in each app.
  agentRules: false,
  cacheComponents: true,
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 31_536_000,
  },
  logging: {
    fetches: {},
  },
  poweredByHeader: false,
  // Requires babel-plugin-react-compiler in the app.
  reactCompiler: true,
  reactStrictMode: true,
  // `typedRoutes` is deliberately off: the apps put their route parameters
  // (site, locale) behind a proxy rewrite, so every public href is a path the
  // router never sees and typed links would reject all of them. The route-aware
  // `PageProps`/`LayoutProps`/`RouteContext` helpers are generated regardless.
} satisfies NextConfig;

/** `images.remotePatterns` entry for a Sanity project's image CDN. */
export const sanityImageRemotePattern = (projectId: string) =>
  ({
    hostname: "cdn.sanity.io",
    pathname: `/images/${projectId}/**`,
    protocol: "https",
  }) as const;

/** Merges image options one level deep; other overrides replace the defaults. */
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
