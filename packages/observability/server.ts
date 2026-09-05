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
    tracesSampleRate: 1,
    includeLocalVariables: true,
    integrations: [consoleLoggingIntegration({ levels: ["error", "warn"] })],
  });
};
