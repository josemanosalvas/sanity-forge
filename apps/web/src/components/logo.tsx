import { SanityImage } from "@repo/blocks/components/sanity-image";
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
  const shared = {
    alt,
    height: 32,
    loading,
    sizes: "210px",
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
          />
          <SanityImage
            {...shared}
            className={cn("hidden h-auto w-44 dark:block", className)}
            image={{ ...imageDark, alt }}
          />
        </>
      ) : (
        <SanityImage
          {...shared}
          className={cn("h-auto w-44", className)}
          image={{ ...image, alt }}
        />
      )}
    </Link>
  );
};
