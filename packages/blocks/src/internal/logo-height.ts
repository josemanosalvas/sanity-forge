interface NormalizeOptions {
  base: number;
  min: number;
  max: number;
}

const aspectRatioFromId = (
  image: { id?: string | null } | null | undefined
): number | null => {
  const id = image?.id;
  if (typeof id !== "string") {
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
  return width / height;
};

export const normalizedLogoHeight = (
  image: { id?: string | null } | null | undefined,
  { base, min, max }: NormalizeOptions
): number => {
  const aspectRatio = aspectRatioFromId(image);
  if (!aspectRatio) {
    return base;
  }
  const height = base / Math.sqrt(aspectRatio);
  return Math.round(Math.min(max, Math.max(min, height)));
};
