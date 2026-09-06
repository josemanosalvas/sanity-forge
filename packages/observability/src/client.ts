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

/**
 * Compared as a literal so the bundler folds it at build time: the replay
 * recorder is then unreferenced and dropped from the bundle unless the flag
 * is set. Reading it through the validated schema would keep it referenced.
 */
const REPLAY_ENABLED = process.env.NEXT_PUBLIC_SENTRY_REPLAY === "true";

/*
 * Error capture must initialize before hydration so failures in the first
 * paint are reported; Session Replay and tracing are separate, heavier
 * decisions and stay opt-in through the public keys.
 */
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
