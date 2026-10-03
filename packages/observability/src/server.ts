/*
 * Node.js runtime initialization, loaded from `instrumentation.ts`.
 */
import { consoleLoggingIntegration, init } from "@sentry/nextjs";

import { keys } from "./keys";

export const initializeObservability = (): void => {
  const {
    NEXT_PUBLIC_SENTRY_DSN: dsn,
    NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE: tracesSampleRate,
  } = keys();
  if (!dsn) {
    return;
  }

  init({
    dsn,
    enableLogs: true,
    // Local variables can hold the Sanity token; never send them from production.
    includeLocalVariables: process.env.NODE_ENV !== "production",
    integrations: [consoleLoggingIntegration({ levels: ["error", "warn"] })],
    tracesSampleRate: tracesSampleRate ?? 1,
  });
};
