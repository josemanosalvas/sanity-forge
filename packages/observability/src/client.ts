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

/** Use a literal environment lookup so Next can inline the replay flag. */
const REPLAY_ENABLED = process.env.NEXT_PUBLIC_SENTRY_REPLAY === "true";

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
    integrations: [
      ...(REPLAY_ENABLED
        ? [replayIntegration({ blockAllMedia: true, maskAllText: true })]
        : []),
      consoleLoggingIntegration({ levels: ["error", "warn"] }),
    ],
    replaysOnErrorSampleRate: REPLAY_ENABLED ? 1 : 0,
    replaysSessionSampleRate: REPLAY_ENABLED ? 0.1 : 0,
    tracesSampleRate: tracesSampleRate ?? 1,
  });
};

export {
  captureException,
  captureRouterTransitionStart as onRouterTransitionStart,
} from "@sentry/nextjs";
