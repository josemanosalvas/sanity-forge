import { keys as analytics } from "@repo/analytics/keys";
import { siteKeys } from "@repo/internationalization/sites";
import { keys as observability } from "@repo/observability/keys";
import { keys as sanity } from "@repo/sanity/keys";
import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  client: {},
  emptyStringAsUndefined: true,
  extends: [sanity(), analytics(), observability()],
  runtimeEnv: {
    DEFAULT_SITE: process.env.DEFAULT_SITE,
  },
  server: {
    /** Site served when the request host matches no known domain. */
    DEFAULT_SITE: z.enum(siteKeys).optional(),
  },
  skipValidation: process.env.SKIP_ENV_VALIDATION === "true",
});
