import {
  hostMatcher,
  isRedirectDestination,
  isRedirectSource,
} from "@repo/internationalization/redirects";
import { hostVariants, siteList } from "@repo/internationalization/sites";
import {
  createNextConfig,
  sanityImageRemotePattern,
  withAnalyzer,
} from "@repo/next-config";
import { withObservability } from "@repo/observability/next-config";
import { keys } from "@repo/sanity/keys";
import { redirectsQuery } from "@repo/sanity/queries";
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import { createClient } from "next-sanity";
import { sanity as sanityCacheLife } from "next-sanity/live/cache-life";

import { env } from "./src/env";

const withNextIntl = createNextIntlPlugin({
  requestConfig: "./src/i18n/request.ts",
});

/** Build-time redirects use public paths and are scoped by host. */
const siteRedirects = async () => {
  try {
    const sanity = keys();
    // Build-time client for published redirects; the app's client is
    // server-only because it carries the viewer token.
    const buildClient = createClient({
      apiVersion: sanity.NEXT_PUBLIC_SANITY_API_VERSION,
      dataset: sanity.NEXT_PUBLIC_SANITY_DATASET,
      perspective: "published",
      projectId: sanity.NEXT_PUBLIC_SANITY_PROJECT_ID,
      token: sanity.SANITY_API_READ_TOKEN,
      useCdn: false,
    });
    const redirects = await buildClient.fetch(redirectsQuery);
    return redirects.flatMap((redirect) => {
      const site = siteList.find(
        (candidate) => candidate.key === redirect.site
      );
      if (!site) {
        return [];
      }
      // The Studio enforces the same rules; this keeps a document written
      // around them (or before them) from failing the build.
      if (
        !(
          isRedirectSource(redirect.source) &&
          isRedirectDestination(redirect.destination)
        )
      ) {
        console.warn(
          `[next.config] Skipping redirect ${redirect.source} → ${redirect.destination}: not a plain public path`
        );
        return [];
      }
      return Object.values(site.domains).flatMap((domain) => {
        const host = domain.split(":")[0] ?? domain;
        return hostVariants(host).map((value) => ({
          destination: redirect.destination,
          has: [{ type: "host" as const, value: hostMatcher(value) }],
          permanent: redirect.permanent,
          source: redirect.source,
        }));
      });
    });
  } catch (error) {
    console.warn(
      "[next.config] Skipping Sanity redirects:",
      (error as Error).message
    );
    return [];
  }
};

const baseConfig: NextConfig = createNextConfig({
  // Sanity Live invalidates by tag, so cached reads live until content changes.
  cacheLife: { default: sanityCacheLife },
  images: {
    remotePatterns: [
      sanityImageRemotePattern(env.NEXT_PUBLIC_SANITY_PROJECT_ID),
    ],
  },
  redirects: siteRedirects,
});

const plugins: ((config: NextConfig) => NextConfig)[] = [
  withNextIntl,
  withObservability,
];
if (process.env.ANALYZE === "true") {
  plugins.push(withAnalyzer);
}

const applyPlugins = (config: NextConfig): NextConfig => {
  let result = config;
  for (const plugin of plugins) {
    result = plugin(result);
  }
  return result;
};

export default applyPlugins(baseConfig);
