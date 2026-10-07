import { SANITY_API_VERSION } from "@repo/blocks/lib/sanity-api-version";
import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

// Production builds and type generation require an explicit Studio URL.
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
      SANITY_COMPILED_QUERIES: process.env.SANITY_COMPILED_QUERIES,
      SANITY_LOG_READS: process.env.SANITY_LOG_READS,
      SANITY_REVALIDATE_SECRET: process.env.SANITY_REVALIDATE_SECRET,
    },
    server: {
      /** Viewer token, required at runtime by `src/token.ts`. */
      SANITY_API_READ_TOKEN: z.string().min(1).optional(),
      /** Opt-in: send each query as compiled by groq-compiler (see `src/compiled-queries.ts`). */
      SANITY_COMPILED_QUERIES: z
        .enum(["true", "false"])
        .default("false")
        .transform((value) => value === "true"),
      /** Logs every Sanity read that runs, i.e. every cache miss. */
      SANITY_LOG_READS: z.stringbool().default(false),
      SANITY_REVALIDATE_SECRET: z.string().min(1).optional(),
    },
    skipValidation: process.env.SKIP_ENV_VALIDATION === "true",
  });
