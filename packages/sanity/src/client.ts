import { createClient } from "next-sanity";

import { keys } from "../keys";

const env = keys();

/**
 * The published, CDN-backed client. `defineLive` reconfigures a copy of it per
 * fetch (perspective, stega, token), so only the coordinates and
 * `stega.studioUrl` matter here.
 */
export const client = createClient({
  projectId: env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: env.NEXT_PUBLIC_SANITY_API_VERSION,
  useCdn: true,
  perspective: "published",
  stega: {
    studioUrl: env.NEXT_PUBLIC_SANITY_STUDIO_URL,
  },
});
