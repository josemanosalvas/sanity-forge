import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const keys = () =>
  createEnv({
    client: {
      NEXT_PUBLIC_GA_MEASUREMENT_ID: z.string().startsWith("G-").optional(),
      /** Vercel Web Analytics (audience); on unless `false`. */
      NEXT_PUBLIC_VERCEL_ANALYTICS: z.enum(["true", "false"]).optional(),
      /** Vercel Speed Insights (real-user Core Web Vitals); on unless `false`. */
      NEXT_PUBLIC_VERCEL_SPEED_INSIGHTS: z.enum(["true", "false"]).optional(),
    },
    emptyStringAsUndefined: true,
    runtimeEnv: {
      NEXT_PUBLIC_GA_MEASUREMENT_ID: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
      NEXT_PUBLIC_VERCEL_ANALYTICS: process.env.NEXT_PUBLIC_VERCEL_ANALYTICS,
      NEXT_PUBLIC_VERCEL_SPEED_INSIGHTS:
        process.env.NEXT_PUBLIC_VERCEL_SPEED_INSIGHTS,
    },
    skipValidation: process.env.SKIP_ENV_VALIDATION === "true",
  });
