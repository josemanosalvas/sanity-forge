"use client";
import { cn } from "cn";
import type { ElementType } from "react";
import { SanityImage as BaseSanityImage } from "sanity-image";
import type { WrapperProps } from "sanity-image";

import { keys } from "../../keys";

const env = keys();

const SANITY_BASE_URL =
  `https://cdn.sanity.io/images/${env.NEXT_PUBLIC_SANITY_PROJECT_ID}/${env.NEXT_PUBLIC_SANITY_DATASET}/` as const;

export interface SanityImageData {
  id?: string | null;
  alt?: string | null;
  preview?: string | null;
  hotspot?: { x: number; y: number } | null;
  crop?: {
    bottom: number;
    left: number;
    right: number;
    top: number;
  } | null;
}

export type SanityImageProps = {
  image: SanityImageData;
} & Omit<WrapperProps<"img">, "id">;

const ImageWrapper = <T extends ElementType = "img">(
  props: WrapperProps<T>
) => <BaseSanityImage baseUrl={SANITY_BASE_URL} {...props} />;

// A well-formed Sanity image asset id: `image-<assetId>-<width>x<height>-<format>`.
const SANITY_ASSET_ID = /^image-[a-zA-Z0-9]+-\d+x\d+-\w+$/u;

// Build the URL for the ORIGINAL SVG asset on the CDN, or null when the id
// isn't an SVG. The `sanity-image` lib emits width-based `?w=…` srcsets, which
// makes the CDN rasterize an SVG into a low-res bitmap that then upscales
// (visible pixelation). For SVG sources we skip that pipeline and point a plain
// <img> at the untransformed file: `image-<hash>-<w>x<h>-svg` →
// `${SANITY_BASE_URL}<hash>-<w>x<h>.svg` (drop the `image-` prefix, swap the
// trailing `-svg` for `.svg`).
export const svgUrlFromAssetId = (id: string | null): string | null => {
  if (!id?.endsWith("-svg")) {
    return null;
  }
  const filename = `${id.replace(/^image-/u, "").replace(/-svg$/u, "")}.svg`;
  return `${SANITY_BASE_URL}${filename}`;
};

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

const HOTSPOT_KEYS = ["x", "y"] as const;
const CROP_KEYS = ["top", "bottom", "left", "right"] as const;

// A half-filled hotspot/crop reaches `sanity-image` as NaN and yields a broken
// transform, so anything not fully numeric is dropped.
const isFiniteAll = (
  value: unknown,
  fields: readonly string[]
): value is Record<string, number> => {
  if (!value || typeof value !== "object") {
    return false;
  }
  const record = value as Record<string, unknown>;
  return fields.every((field) => Number.isFinite(record[field]));
};

export const SanityImage = ({ image, ...props }: SanityImageProps) => {
  const id = resolveAssetId(image);
  if (!(id && image)) {
    return null;
  }

  // Serve SVGs untouched, without raster transforms or LQIP styling.
  const svgUrl = svgUrlFromAssetId(id);
  if (svgUrl) {
    return (
      // oxlint-disable-next-line next/no-img-element -- serves the original SVG untouched by the CDN transform pipeline
      <img
        alt={props.alt ?? image.alt ?? ""}
        className={cn("object-contain", props.className)}
        decoding="async"
        height={props.height}
        loading={props.loading ?? "lazy"}
        src={svgUrl}
        style={props.style}
        width={props.width}
      />
    );
  }

  const processedData = {
    alt: props.alt ?? image.alt ?? "",
    id,
    ...(image.preview && { preview: image.preview }),
    ...(isFiniteAll(image.hotspot, HOTSPOT_KEYS) && { hotspot: image.hotspot }),
    ...(isFiniteAll(image.crop, CROP_KEYS) && { crop: image.crop }),
  };

  return <ImageWrapper {...props} {...processedData} />;
};
