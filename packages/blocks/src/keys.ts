import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

/**
 * Public Sanity coordinates only. Client modules read this schema; the
 * server-side one with the tokens lives in `@repo/sanity/keys`.
 */
export const keys = () =>
  createEnv({
    client: {
      NEXT_PUBLIC_SANITY_DATASET: z.string().min(1),
      NEXT_PUBLIC_SANITY_PROJECT_ID: z.string().min(1),
      /** Where the Studio is hosted, for Presentation overlays. */
      NEXT_PUBLIC_SANITY_STUDIO_URL: z.url().default("http://localhost:3333"),
    },
    emptyStringAsUndefined: true,
    runtimeEnv: {
      NEXT_PUBLIC_SANITY_DATASET: process.env.NEXT_PUBLIC_SANITY_DATASET,
      NEXT_PUBLIC_SANITY_PROJECT_ID: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
      NEXT_PUBLIC_SANITY_STUDIO_URL: process.env.NEXT_PUBLIC_SANITY_STUDIO_URL,
    },
    skipValidation: process.env.SKIP_ENV_VALIDATION === "true",
  });
