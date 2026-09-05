import { keys } from "@repo/sanity/keys";
import { createDataAttribute } from "next-sanity";

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
