import { createClient } from "next-sanity";

import { keys } from "../keys";
import { token } from "./token";

const env = keys();

/**
 * The published, CDN-backed client. `defineLive` reconfigures a copy of it per
 * fetch (perspective, stega), so only the coordinates, the token and
 * `stega.studioUrl` matter here. The token makes private datasets work and
 * makes this module server-only; build-time code creates its own client.
 */
export const client = createClient({
  apiVersion: env.NEXT_PUBLIC_SANITY_API_VERSION,
  dataset: env.NEXT_PUBLIC_SANITY_DATASET,
  perspective: "published",
  projectId: env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  stega: {
    studioUrl: env.NEXT_PUBLIC_SANITY_STUDIO_URL,
  },
  token,
  useCdn: true,
});
