import type { SanityImageData } from "../components/sanity-image";
import { getImageDimensions } from "./sanity-image";

interface NormalizeOptions {
  base: number;
  min: number;
  max: number;
}

export const normalizedLogoHeight = (
  image: SanityImageData | null | undefined,
  { base, min, max }: NormalizeOptions
): number => {
  const aspectRatio = getImageDimensions(image)?.aspectRatio;
  if (!aspectRatio) {
    return base;
  }
  const height = base / Math.sqrt(aspectRatio);
  return Math.round(Math.min(max, Math.max(min, height)));
};
