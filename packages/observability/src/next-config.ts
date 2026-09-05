import { withSentryConfig } from "@sentry/nextjs/config";
import type { SentryBuildOptions } from "@sentry/nextjs/config";
import type { NextConfig } from "next";

import { keys } from "./keys";

export const sentryBuildOptions: SentryBuildOptions = {
  authToken: keys().SENTRY_AUTH_TOKEN,
  bundleSizeOptimizations: { excludeDebugStatements: true },
  org: keys().SENTRY_ORG,
  project: keys().SENTRY_PROJECT,
  silent: !process.env.CI,
  telemetry: false,
  // Route browser reports through the app to sidestep ad blockers. Keep the
  // path out of the proxy matcher.
  tunnelRoute: "/monitoring",
  widenClientFileUpload: true,
};

/** Adds source-map upload and Sentry's build integration when a DSN is configured. */
export const withObservability = (config: NextConfig): NextConfig =>
  keys().NEXT_PUBLIC_SENTRY_DSN
    ? withSentryConfig(config, sentryBuildOptions)
    : config;
