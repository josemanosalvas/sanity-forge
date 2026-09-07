import type { SanityImageData } from "../components/sanity-image";

// A well-formed Sanity image asset id: `image-<assetId>-<width>x<height>-<format>`.
const SANITY_ASSET_ID = /^image-[a-zA-Z0-9]+-\d+x\d+-\w+$/u;

// Reject malformed refs before the image library tries to parse them.
export const resolveAssetId = (
  image?: SanityImageData | null
): string | null => {
  if (!image?.id || typeof image.id !== "string") {
    return null;
  }
  const id = image.id.replace(/^drafts\./u, "");
  return SANITY_ASSET_ID.test(id) ? id : null;
};

// Asset IDs include dimensions; logo sizing needs no additional query.
export const getImageDimensions = (
  image: SanityImageData | null | undefined
): { width: number; height: number; aspectRatio: number } | null => {
  const id = resolveAssetId(image);
  if (!id) {
    return null;
  }
  const match = /-(?<width>\d+)x(?<height>\d+)-/u.exec(id);
  if (!match) {
    return null;
  }
  const width = Number(match.groups?.width);
  const height = Number(match.groups?.height);
  if (!(width > 0 && height > 0)) {
    return null;
  }
  return { aspectRatio: width / height, height, width };
};
