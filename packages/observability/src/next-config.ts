import { withSentryConfig } from "@sentry/nextjs/config";
import type { NextConfig } from "next";

import { keys } from "./keys";

/** Adds source-map upload and Sentry's build integration when a DSN is configured. */
export const withObservability = (config: NextConfig): NextConfig => {
  const env = keys();
  if (!env.NEXT_PUBLIC_SENTRY_DSN) {
    return config;
  }
  return withSentryConfig(config, {
    authToken: env.SENTRY_AUTH_TOKEN,
    bundleSizeOptimizations: { excludeDebugStatements: true },
    org: env.SENTRY_ORG,
    project: env.SENTRY_PROJECT,
    silent: !process.env.CI,
    telemetry: false,
    // Route browser reports through the app to sidestep ad blockers. Keep the
    // path out of the proxy matcher.
    tunnelRoute: "/monitoring",
    widenClientFileUpload: true,
  });
};
