import { resolveAssetId } from "@repo/blocks/lib/sanity-image";
import { createImageUrlBuilder } from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url";

import { keys } from "./keys";

const env = keys();

const builder = createImageUrlBuilder({
  dataset: env.NEXT_PUBLIC_SANITY_DATASET,
  projectId: env.NEXT_PUBLIC_SANITY_PROJECT_ID,
});

/** An image as `imageFields` projects it: the asset ref plus the editor's framing. */
export interface ProjectedImage {
  id?: string | null;
  hotspot?: { x: number; y: number } | null;
  crop?: {
    bottom: number;
    left: number;
    right: number;
    top: number;
  } | null;
}

/** Image URL builder bound to this project. */
export const urlFor = (source: SanityImageSource) =>
  builder.image(source).auto("format").quality(80);

/**
 * Resolves a projected image to a CDN URL cropped to `width`×`height` around
 * the hotspot, or undefined. Hotspot and crop live on the image object, not the
 * asset, so they only survive when the caller projects the object. `imageFields`
 * keeps the hotspot centre but not its radii, which the builder multiplies by;
 * pad them to the full frame it assumes by default, or the rect comes out NaN.
 */
export const imageUrl = (
  image: ProjectedImage | null | undefined,
  { width, height }: { width: number; height: number }
): string | undefined => {
  const id = resolveAssetId(image);
  if (!(id && image)) {
    return undefined;
  }
  return urlFor({
    asset: { _ref: id },
    ...(image.crop && { crop: image.crop }),
    ...(image.hotspot && {
      hotspot: { ...image.hotspot, height: 1, width: 1 },
    }),
  })
    .width(width)
    .height(height)
    .fit("crop")
    .url();
};
