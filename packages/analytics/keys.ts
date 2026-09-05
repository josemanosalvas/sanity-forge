import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

/**
 * Analytics is optional: Vercel Web Analytics needs no configuration and
 * is on by default on Vercel, Google Analytics only loads with an ID.
 */
export const keys = () =>
  createEnv({
    skipValidation: process.env.SKIP_ENV_VALIDATION === "true",
    client: {
      NEXT_PUBLIC_GA_MEASUREMENT_ID: z.string().startsWith("G-").optional(),
      NEXT_PUBLIC_VERCEL_ANALYTICS: z.enum(["true", "false"]).optional(),
    },
    runtimeEnv: {
      NEXT_PUBLIC_GA_MEASUREMENT_ID: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
      NEXT_PUBLIC_VERCEL_ANALYTICS: process.env.NEXT_PUBLIC_VERCEL_ANALYTICS,
    },
    emptyStringAsUndefined: true,
  });
