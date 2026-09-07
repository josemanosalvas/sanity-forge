"use client";
import { cn } from "cn";
import type { ElementType } from "react";
import { SanityImage as BaseSanityImage } from "sanity-image";
import type { WrapperProps } from "sanity-image";

import { keys } from "../keys";
import { resolveAssetId } from "../lib/sanity-image";

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

// Serve SVGs without width transforms, which rasterize them on the CDN.
export const svgUrlFromAssetId = (id: string | null): string | null => {
  if (!id?.endsWith("-svg")) {
    return null;
  }
  const filename = `${id.replace(/^image-/u, "").replace(/-svg$/u, "")}.svg`;
  return `${SANITY_BASE_URL}${filename}`;
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
