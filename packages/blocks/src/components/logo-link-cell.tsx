import { cn } from "cn";
import Link from "next/link";
import type { CSSProperties } from "react";

import { sanitizeHref } from "../lib/safe-href";
import type { SanityImageData } from "./sanity-image";
import {
  getImageDimensions,
  resolveAssetId,
  SanityImage,
} from "./sanity-image";

export interface LogoLinkCellProps {
  image?: SanityImageData | null;
  href?: string | null;
  openInNewTab?: boolean | null;
  imageClassName: string;
  cellClassName: string;
  height: number;
  width: number;
  imageStyle?: CSSProperties;
}

export const LogoLinkCell = ({
  image,
  href,
  openInNewTab,
  imageClassName,
  cellClassName,
  height,
  width,
  imageStyle,
}: Readonly<LogoLinkCellProps>) => {
  // Avoid an empty link when SanityImage rejects the asset.
  if (!(resolveAssetId(image) && image)) {
    return null;
  }

  // The cell renders at `imageStyle.height` with `w-auto`, so the displayed
  // width follows the asset's ratio, not the CDN request width.
  const renderedHeight =
    typeof imageStyle?.height === "number" ? imageStyle.height : height;
  const ratio = getImageDimensions(image)?.aspectRatio ?? width / height;
  const media = (
    <SanityImage
      className={imageClassName}
      height={height}
      image={image}
      loading="lazy"
      placeholder={false}
      sizes={`${Math.round(renderedHeight * ratio)}px`}
      style={imageStyle}
      width={width}
    />
  );

  // The image alt supplies the link name; leave unnamed logos unlinked.
  const safeHref = sanitizeHref(href);
  if (safeHref && image.alt?.trim()) {
    return (
      // An inset ring stays visible inside the clipped marquee.
      <Link
        className={cn("focus-ring-inset", cellClassName)}
        href={safeHref}
        rel={openInNewTab ? "noopener noreferrer" : undefined}
        target={openInNewTab ? "_blank" : undefined}
      >
        {media}
      </Link>
    );
  }

  return <div className={cellClassName}>{media}</div>;
};
