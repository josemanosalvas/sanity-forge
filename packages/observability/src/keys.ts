import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const keys = () =>
  createEnv({
    client: {
      NEXT_PUBLIC_SENTRY_DSN: z.url().optional(),
      /** Bundles and enables Session Replay; off unless set to `true`. */
      NEXT_PUBLIC_SENTRY_REPLAY: z.enum(["true", "false"]).optional(),
      /** Share of transactions traced, 0 to 1; defaults to 1. */
      NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE: z.coerce
        .number()
        .min(0)
        .max(1)
        .optional(),
    },
    emptyStringAsUndefined: true,
    runtimeEnv: {
      NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
      NEXT_PUBLIC_SENTRY_REPLAY: process.env.NEXT_PUBLIC_SENTRY_REPLAY,
      NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE:
        process.env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE,
      SENTRY_AUTH_TOKEN: process.env.SENTRY_AUTH_TOKEN,
      SENTRY_ORG: process.env.SENTRY_ORG,
      SENTRY_PROJECT: process.env.SENTRY_PROJECT,
    },
    server: {
      SENTRY_AUTH_TOKEN: z.string().optional(),
      SENTRY_ORG: z.string().optional(),
      SENTRY_PROJECT: z.string().optional(),
    },
    skipValidation: process.env.SKIP_ENV_VALIDATION === "true",
  });
