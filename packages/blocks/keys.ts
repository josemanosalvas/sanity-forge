import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

/**
 * Environment the block renderers need at runtime: only the public Sanity
 * project coordinates, used to build image CDN URLs. Both values are inlined
 * into client bundles by Next.js, so they must stay `NEXT_PUBLIC_`.
 */
export const keys = () =>
  createEnv({
    skipValidation: process.env.SKIP_ENV_VALIDATION === "true",
    client: {
      NEXT_PUBLIC_SANITY_PROJECT_ID: z.string().min(1),
      NEXT_PUBLIC_SANITY_DATASET: z.string().min(1),
    },
    runtimeEnv: {
      NEXT_PUBLIC_SANITY_PROJECT_ID: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
      NEXT_PUBLIC_SANITY_DATASET: process.env.NEXT_PUBLIC_SANITY_DATASET,
    },
    emptyStringAsUndefined: true,
  });
