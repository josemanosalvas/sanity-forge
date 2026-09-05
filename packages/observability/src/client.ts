/*
 * Browser initialization. Runs from `instrumentation-client.ts` before
 * hydration; a no-op without a DSN.
 */
import {
  consoleLoggingIntegration,
  init,
  replayIntegration,
} from "@sentry/nextjs";

import { keys } from "./keys";

export const initializeObservability = (): void => {
  const dsn = keys().NEXT_PUBLIC_SENTRY_DSN;
  if (!dsn) {
    return;
  }

  init({
    dsn,
    enableLogs: true,
    integrations: [
      replayIntegration({ blockAllMedia: true, maskAllText: true }),
      consoleLoggingIntegration({ levels: ["error", "warn"] }),
    ],
    replaysOnErrorSampleRate: 1,
    replaysSessionSampleRate: 0.1,
    tracesSampleRate: 1,
  });
};

export {
  captureException,
  captureRouterTransitionStart as onRouterTransitionStart,
} from "@sentry/nextjs";
