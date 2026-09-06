"use client";
import { cn } from "cn";
import type { ElementType } from "react";
import { SanityImage as BaseSanityImage } from "sanity-image";
import type { WrapperProps } from "sanity-image";

// Read directly: Next inlines NEXT_PUBLIC_ values into client bundles, and
// the app validates them at startup, so a schema here would only add its
// validator to every page's JavaScript.
const SANITY_BASE_URL = `https://cdn.sanity.io/images/${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}/${process.env.NEXT_PUBLIC_SANITY_DATASET}/`;

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
  /**
   * Whether to blur up from the LQIP. Off automatically for eager and
   * high-priority images; pass `false` for decorative repeats (logo
   * marquees, theme twins) where the inlined placeholder costs more than it
   * shows.
   */
  placeholder?: boolean;
} & Omit<WrapperProps<"img">, "id">;

const ImageWrapper = <T extends ElementType = "img">(
  props: WrapperProps<T>
) => <BaseSanityImage baseUrl={SANITY_BASE_URL} {...props} />;

// A well-formed Sanity image asset id: `image-<assetId>-<width>x<height>-<format>`.
const SANITY_ASSET_ID = /^image-[a-zA-Z0-9]+-\d+x\d+-\w+$/u;

// Serve SVGs without width transforms, which rasterize them on the CDN.
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

/** Below this requested width a base64 placeholder costs more bytes than it shows. */
const MIN_PREVIEW_WIDTH = 64;

/**
 * The LQIP wrapper hides the full image (`opacity: 0`) until React hydrates
 * and its `onLoad` runs, so an eager image, the page's LCP candidate, must
 * render as a plain `<img>` that can paint from the server HTML.
 */
type ImgProps = Omit<SanityImageProps, "image" | "placeholder">;

const wantsPreview = (
  image: SanityImageData,
  props: ImgProps,
  placeholder: boolean
) =>
  placeholder &&
  Boolean(image.preview) &&
  props.loading !== "eager" &&
  props.fetchPriority !== "high" &&
  (typeof props.width !== "number" || props.width >= MIN_PREVIEW_WIDTH);

/** The reserved box for an SVG follows the asset's own ratio, not the request's. */
const svgBox = (image: SanityImageData, props: ImgProps) => {
  const dimensions = getImageDimensions(image);
  if (!dimensions) {
    return { height: props.height, width: props.width };
  }
  if (typeof props.height === "number") {
    return {
      height: props.height,
      width: Math.round(props.height * dimensions.aspectRatio),
    };
  }
  if (typeof props.width === "number") {
    return {
      height: Math.round(props.width / dimensions.aspectRatio),
      width: props.width,
    };
  }
  return { height: dimensions.height, width: dimensions.width };
};

export const SanityImage = ({
  image,
  placeholder = true,
  ...props
}: SanityImageProps) => {
  const id = resolveAssetId(image);
  if (!(id && image)) {
    return null;
  }

  const svgUrl = svgUrlFromAssetId(id);
  if (svgUrl) {
    const box = svgBox(image, props);
    return (
      // oxlint-disable-next-line next/no-img-element -- serves the original SVG untouched by the CDN transform pipeline
      <img
        alt={props.alt ?? image.alt ?? ""}
        className={cn("object-contain", props.className)}
        decoding="async"
        fetchPriority={props.fetchPriority}
        height={box.height}
        loading={props.loading ?? "lazy"}
        sizes={props.sizes}
        src={svgUrl}
        style={props.style}
        width={box.width}
      />
    );
  }

  const preview = wantsPreview(image, props, placeholder)
    ? image.preview
    : undefined;
  const processedData = {
    alt: props.alt ?? image.alt ?? "",
    id,
    ...(preview && { preview }),
    ...(isFiniteAll(image.hotspot, HOTSPOT_KEYS) && { hotspot: image.hotspot }),
    ...(isFiniteAll(image.crop, CROP_KEYS) && { crop: image.crop }),
  };

  return <ImageWrapper {...props} {...processedData} />;
};
