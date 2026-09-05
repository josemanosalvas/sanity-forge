import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

/** Pin a date so `perspective` defaults to `published` (API >= 2025-02-19). */
export const DEFAULT_SANITY_API_VERSION = "2026-09-01";

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
        .default(DEFAULT_SANITY_API_VERSION),
      NEXT_PUBLIC_SANITY_DATASET: z.string().min(1),
      NEXT_PUBLIC_SANITY_PROJECT_ID: z.string().min(1),
      /** Where the Studio is hosted, for edit-intent links and stega. */
      NEXT_PUBLIC_SANITY_STUDIO_URL: z.url().default("http://localhost:3333"),
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
      /** Shared secret for the `/api/revalidate` webhook; the route fails closed when unset. */
      SANITY_REVALIDATE_SECRET: z.string().min(1).optional(),
    },
    skipValidation: process.env.SKIP_ENV_VALIDATION === "true",
  });
