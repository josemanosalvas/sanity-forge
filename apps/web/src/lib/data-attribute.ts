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
    id,
    type,
    path,
    baseUrl: env.NEXT_PUBLIC_SANITY_STUDIO_URL,
    projectId: env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: env.NEXT_PUBLIC_SANITY_DATASET,
  }).toString();
