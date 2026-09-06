import {
  getImageDimensions,
  SanityImage,
} from "@repo/blocks/components/sanity-image";
import type { SanityImageData } from "@repo/blocks/components/sanity-image";
import { Link } from "@repo/internationalization/navigation";
import { cn } from "cn";

interface LogoProps {
  image?: SanityImageData | null;
  imageDark?: SanityImageData | null;
  alt: string;
  className?: string;
  priority?: boolean;
}

export const Logo = ({
  image,
  imageDark,
  alt,
  className,
  priority = true,
}: LogoProps) => {
  if (!image?.id) {
    return (
      <Link className="focus-ring inline-block text-lg font-semibold" href="/">
        {alt}
      </Link>
    );
  }

  const loading = priority ? "eager" : "lazy";
  // Callers render the mark 20px tall (`h-5 w-auto`); the width follows the
  // asset's ratio, capped by `w-44`. No blur-up: it would hide the mark until
  // hydration, and the dark twin must stay a plain lazy image.
  const renderedWidth = Math.min(
    176,
    Math.round(20 * (getImageDimensions(image)?.aspectRatio ?? 5))
  );
  const shared = {
    alt,
    height: 32,
    placeholder: false,
    sizes: `${renderedWidth}px`,
    width: 210,
  } as const;

  return (
    <Link className="focus-ring inline-block" href="/">
      {imageDark?.id ? (
        <>
          <SanityImage
            {...shared}
            className={cn("h-auto w-44 dark:hidden", className)}
            image={{ ...image, alt }}
            loading={loading}
          />
          {/* Hidden in light mode: lazy, so it is only fetched when shown. */}
          <SanityImage
            {...shared}
            className={cn("hidden h-auto w-44 dark:block", className)}
            image={{ ...imageDark, alt }}
            loading="lazy"
          />
        </>
      ) : (
        <SanityImage
          {...shared}
          className={cn("h-auto w-44", className)}
          image={{ ...image, alt }}
          loading={loading}
        />
      )}
    </Link>
  );
};
