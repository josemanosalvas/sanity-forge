import { SANITY_API_VERSION } from "@repo/blocks/lib/sanity-api-version";
import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

/**
 * Where the Studio is hosted, for edit-intent links and stega. The localhost
 * default is a development convenience: in production it would silently bake
 * localhost into every edit link and `data-sanity` attribute, so the variable
 * is required there and the build fails instead of degrading.
 */
const studioUrl =
  process.env.NODE_ENV === "production"
    ? z.url()
    : z.url().default("http://localhost:3333");

/**
 * Sanity runtime configuration for Next.js consumers. The schema keeps the
 * token optional so `next.config.ts` and TypeGen load without secrets;
 * `src/token.ts` enforces it wherever Sanity Live actually runs.
 */
export const keys = () =>
  createEnv({
    client: {
      NEXT_PUBLIC_SANITY_API_VERSION: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/u)
        .default(SANITY_API_VERSION),
      NEXT_PUBLIC_SANITY_DATASET: z.string().min(1),
      NEXT_PUBLIC_SANITY_PROJECT_ID: z.string().min(1),
      NEXT_PUBLIC_SANITY_STUDIO_URL: studioUrl,
    },
    emptyStringAsUndefined: true,
    runtimeEnv: {
      NEXT_PUBLIC_SANITY_API_VERSION:
        process.env.NEXT_PUBLIC_SANITY_API_VERSION,
      NEXT_PUBLIC_SANITY_DATASET: process.env.NEXT_PUBLIC_SANITY_DATASET,
      NEXT_PUBLIC_SANITY_PROJECT_ID: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
      NEXT_PUBLIC_SANITY_STUDIO_URL: process.env.NEXT_PUBLIC_SANITY_STUDIO_URL,
      SANITY_API_READ_TOKEN: process.env.SANITY_API_READ_TOKEN,
      SANITY_REVALIDATE_SECRET: process.env.SANITY_REVALIDATE_SECRET,
    },
    server: {
      /** Viewer token, required at runtime by `src/token.ts`. */
      SANITY_API_READ_TOKEN: z.string().min(1).optional(),
      SANITY_REVALIDATE_SECRET: z.string().min(1).optional(),
    },
    skipValidation: process.env.SKIP_ENV_VALIDATION === "true",
  });
