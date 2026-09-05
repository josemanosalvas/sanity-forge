import { createImageUrlBuilder } from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url";

import { keys } from "../keys";

const env = keys();

const builder = createImageUrlBuilder({
  dataset: env.NEXT_PUBLIC_SANITY_DATASET,
  projectId: env.NEXT_PUBLIC_SANITY_PROJECT_ID,
});

/** Image URL builder bound to this project. */
export const urlFor = (source: SanityImageSource) =>
  builder.image(source).auto("format").quality(80);

/** Resolves a projected image (`{ id }`) to a sized CDN URL, or undefined. */
export const imageUrl = (
  image: { id?: string | null } | null | undefined,
  { width, height }: { width: number; height: number }
): string | undefined => {
  if (!image?.id) {
    return undefined;
  }
  return urlFor({ _ref: image.id })
    .width(width)
    .height(height)
    .fit("crop")
    .url();
};
