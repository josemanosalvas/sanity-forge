import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

/**
 * Error tracking is optional. Without a DSN nothing is initialized and the
 * logger falls back to the console, so a fresh checkout runs with no vendor
 * account.
 */
export const keys = () =>
  createEnv({
    client: {
      NEXT_PUBLIC_SENTRY_DSN: z.url().optional(),
    },
    emptyStringAsUndefined: true,
    runtimeEnv: {
      NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
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
