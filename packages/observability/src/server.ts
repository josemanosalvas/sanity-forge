/*
 * Node.js runtime initialization, loaded from `instrumentation.ts`.
 */
import { consoleLoggingIntegration, init } from "@sentry/nextjs";

import { keys } from "./keys";

export const initializeObservability = (): void => {
  const dsn = keys().NEXT_PUBLIC_SENTRY_DSN;
  if (!dsn) {
    return;
  }

  init({
    dsn,
    enableLogs: true,
    // Frame locals can hold the Sanity token or cookie values; keep them to
    // environments where the event never leaves the team.
    includeLocalVariables: process.env.NODE_ENV !== "production",
    integrations: [consoleLoggingIntegration({ levels: ["error", "warn"] })],
    tracesSampleRate: keys().NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE ?? 1,
  });
};
