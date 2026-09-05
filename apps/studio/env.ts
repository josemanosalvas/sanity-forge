import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

/**
 * Studio runtime configuration. Sanity's bundler inlines every
 * `process.env.SANITY_STUDIO_*` reference, so each variable must be spelled
 * out here rather than read from a dynamic object.
 */
export const env = createEnv({
  client: {
    SANITY_STUDIO_DATASET: z.string().min(1).default("production"),
    SANITY_STUDIO_PREVIEW_ENVIRONMENT: z
      .enum(["development", "production"])
      .optional(),
    SANITY_STUDIO_PROJECT_ID: z.string().min(1),
    SANITY_STUDIO_TITLE: z.string().min(1).default("Sanity Forge"),
  },
  clientPrefix: "SANITY_STUDIO_",
  emptyStringAsUndefined: true,
  runtimeEnvStrict: {
    SANITY_STUDIO_DATASET: process.env.SANITY_STUDIO_DATASET,
    SANITY_STUDIO_PREVIEW_ENVIRONMENT:
      process.env.SANITY_STUDIO_PREVIEW_ENVIRONMENT,
    SANITY_STUDIO_PROJECT_ID: process.env.SANITY_STUDIO_PROJECT_ID,
    SANITY_STUDIO_TITLE: process.env.SANITY_STUDIO_TITLE,
  },
  skipValidation: process.env.SKIP_ENV_VALIDATION === "true",
});
