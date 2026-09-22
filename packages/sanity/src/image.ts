import { resolveAssetId } from "@repo/blocks/lib/sanity-image";
import { createImageUrlBuilder } from "@sanity/image-url";

import { keys } from "./keys";

const env = keys();

const builder = createImageUrlBuilder({
  dataset: env.NEXT_PUBLIC_SANITY_DATASET,
  projectId: env.NEXT_PUBLIC_SANITY_PROJECT_ID,
});

interface ProjectedImage {
  id?: string | null;
  hotspot?: { x: number; y: number } | null;
  crop?: {
    bottom: number;
    left: number;
    right: number;
    top: number;
  } | null;
}

/** Social crawlers need a predictable format; preserve the editor's crop and focal point. */
export const ogImageUrl = (
  image: ProjectedImage | null | undefined
): string | undefined => {
  const id = resolveAssetId(image);
  if (!(id && image)) {
    return undefined;
  }
  return builder
    .image({
      asset: { _ref: id },
      ...(image.crop && { crop: image.crop }),
      ...(image.hotspot && {
        // The projection keeps only the centre; the builder requires dimensions too.
        hotspot: { ...image.hotspot, height: 1, width: 1 },
      }),
    })
    .width(1200)
    .height(630)
    .fit("crop")
    .format("jpg")
    .quality(80)
    .url();
};
