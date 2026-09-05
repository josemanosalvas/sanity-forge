import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const keys = () =>
  createEnv({
    client: {
      NEXT_PUBLIC_SANITY_DATASET: z.string().min(1),
      NEXT_PUBLIC_SANITY_PROJECT_ID: z.string().min(1),
    },
    emptyStringAsUndefined: true,
    runtimeEnv: {
      NEXT_PUBLIC_SANITY_DATASET: process.env.NEXT_PUBLIC_SANITY_DATASET,
      NEXT_PUBLIC_SANITY_PROJECT_ID: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    },
    skipValidation: process.env.SKIP_ENV_VALIDATION === "true",
  });
