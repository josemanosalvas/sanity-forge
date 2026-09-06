import { keys } from "@repo/blocks/keys";
import { createDataAttribute } from "next-sanity";

// The blocks package's schema names only NEXT_PUBLIC_ values, so this module
// can sit in the client graph (Presentation overlays run in the browser)
// without pulling the secret-declaring Sanity schema in with it.
const env = keys();

/** `data-sanity` attribute for a document path, so Presentation overlays map back to the Studio. */
export const sanityDataAttribute = ({
  id,
  type,
  path,
}: {
  id: string;
  type: string;
  path: string;
}): string =>
  createDataAttribute({
    baseUrl: env.NEXT_PUBLIC_SANITY_STUDIO_URL,
    dataset: env.NEXT_PUBLIC_SANITY_DATASET,
    id,
    path,
    projectId: env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    type,
  }).toString();
