import { cn } from "cn";

import { BlockLabel, VisitLabel } from "../../components/labels";
import { resolveAssetId, SanityImage } from "../../components/sanity-image";
import type { SanityImageData } from "../../components/sanity-image";
import { normalizedLogoHeight } from "../../lib/logo-height";
import { sanitizeHref } from "../../lib/safe-href";

export interface ShowcaseGridItem {
  _key: string;
  siteName?: string | null;
  url?: string | null;
  category?: string | null;
  screenshot?: SanityImageData | null;
  attributionLogo?: SanityImageData | null;
  featured?: boolean | null;
}

export interface ShowcaseGridProps {
  title?: string | null;
  description?: string | null;
  items?: ShowcaseGridItem[] | null;
  /** Leads the page: the featured screenshot is then the likely LCP image. */
  isFirst?: boolean;
}

type ImageSource =
  | { kind: "sanity"; image: SanityImageData }
  | { kind: "none" };

interface CardView {
  id: string;
  name: string;
  url: string | null;
  category: string | null;
  screenshot: ImageSource;
  logo: SanityImageData | null;
}

// Gate on the same canonical validity as SanityImage/resolveAssetId; the local
// type guard only exists to narrow away null/undefined for the call sites.
const hasValidAssetId = (
  image: SanityImageData | null | undefined
): image is SanityImageData => resolveAssetId(image) !== null;

const cmsToView = (item: ShowcaseGridItem): CardView => {
  const name = item.siteName ?? "Untitled";

  const screenshot: ImageSource = hasValidAssetId(item.screenshot)
    ? { image: item.screenshot, kind: "sanity" }
    : { kind: "none" };

  return {
    category: item.category?.trim() || null,
    id: item._key,
    logo: hasValidAssetId(item.attributionLogo) ? item.attributionLogo : null,
    name,
    screenshot,
    url: sanitizeHref(item.url) ?? null,
  };
};

const AttributionLogo = ({
  item,
  base = 20,
  className,
}: Readonly<{ item: CardView; base?: number; className?: string }>) => {
  if (!item.logo) {
    return null;
  }
  return (
    <SanityImage
      alt={`${item.name} logo`}
      className={cn("w-auto shrink-0 object-contain", className)}
      height={24}
      image={item.logo}
      sizes="96px"
      style={{
        height: normalizedLogoHeight(item.logo, {
          base,
          max: Math.round(base * 1.2),
          min: Math.round(base * 0.8),
        }),
      }}
      width={96}
    />
  );
};

const AttributionMark = ({ item }: Readonly<{ item: CardView }>) => (
  <span className="flex size-6 shrink-0 items-center justify-center overflow-hidden bg-zinc-900 text-white">
    {item.logo ? (
      <SanityImage
        alt={`${item.name} logo`}
        className="size-full object-contain"
        height={24}
        image={item.logo}
        sizes="24px"
        width={24}
      />
    ) : (
      <span className="text-sm leading-none font-medium">
        {item.name.charAt(0).toUpperCase()}
      </span>
    )}
  </span>
);

const ScreenshotImage = ({
  screenshot,
  name,
  sizes,
  className,
  loading,
  fetchPriority,
}: Readonly<{
  screenshot: ImageSource;
  name: string;
  sizes: string;
  className?: string;
  loading?: "eager" | "lazy";
  fetchPriority?: "high" | "low" | "auto";
}>) => {
  if (screenshot.kind === "sanity") {
    return (
      // A fixed 16:9 box: cover mode lets the CDN crop around the editor's
      // hotspot instead of the browser cropping around the centre.
      <SanityImage
        alt={`${name} website screenshot`}
        className={cn("absolute inset-0 size-full object-cover", className)}
        fetchPriority={fetchPriority}
        height={810}
        image={screenshot.image}
        loading={loading}
        mode="cover"
        sizes={sizes}
        width={1440}
      />
    );
  }
  return null;
};

const FocusBrackets = () => {
  const corner =
    "absolute size-2 border-highlight-foreground opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100";
  return (
    <>
      <span
        aria-hidden="true"
        className={cn(corner, "-top-3 -left-3 border-r border-b")}
      />
      <span
        aria-hidden="true"
        className={cn(corner, "-top-3 -right-3 border-b border-l")}
      />
      <span
        aria-hidden="true"
        className={cn(corner, "-bottom-3 -left-3 border-t border-r")}
      />
      <span
        aria-hidden="true"
        className={cn(corner, "-right-3 -bottom-3 border-t border-l")}
      />
    </>
  );
};

const ShowcaseHeader = ({
  title,
  description,
}: Readonly<{
  title?: string | null;
  description?: string | null;
}>) => {
  if (!(title || description)) {
    return null;
  }
  return (
    <div className="mx-auto flex max-w-4xl flex-col items-center gap-4 text-center">
      {title ? (
        <h2 className="block-title text-balance lg:text-[64px] lg:leading-[1.1]">
          {title}
        </h2>
      ) : null}
      {description ? (
        <p className="body-text text-muted-foreground max-w-xl text-pretty">
          {description}
        </p>
      ) : null}
    </div>
  );
};

const FeaturedBanner = ({
  featured,
  side = "left",
  eager = false,
}: Readonly<{
  featured: CardView;
  side?: "left" | "right";
  /** The banner leads the page, so its screenshot loads at high priority. */
  eager?: boolean;
}>) => {
  const panelRight = side === "right";
  const clickable = Boolean(featured.url);

  const chip = (
    <span className="bg-background text-foreground relative flex items-center justify-center px-4 py-4 group-hover:bg-black group-hover:text-white group-focus-visible:bg-black group-focus-visible:text-white">
      {clickable ? <FocusBrackets /> : null}
      {featured.logo ? (
        <AttributionLogo
          base={28}
          className="invert group-hover:invert-0 group-focus-visible:invert-0 dark:invert-0"
          item={featured}
        />
      ) : (
        <span className="text-lg font-normal tracking-[-0.015em]">
          {featured.name}
        </span>
      )}
    </span>
  );

  const panel = (
    <div className="bg-grid-dots text-foreground relative flex min-h-64 items-center justify-center overflow-hidden p-8 sm:min-h-80 lg:min-h-0 lg:p-14">
      {clickable ? (
        <span
          aria-hidden="true"
          className="bg-highlight absolute inset-0 opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100"
        />
      ) : null}
      {chip}
    </div>
  );

  const screenshot = (
    <div
      className="bg-muted relative aspect-video w-full overflow-hidden before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:z-10 before:h-28 before:bg-gradient-to-b before:from-black/60 before:to-transparent before:content-['']"
      data-nav-contrast="dark"
    >
      <ScreenshotImage
        fetchPriority={eager ? "high" : undefined}
        loading={eager ? "eager" : "lazy"}
        name={featured.name}
        screenshot={featured.screenshot}
        sizes="(min-width: 1440px) 1024px, (min-width: 1024px) calc(100vw - 416px), calc(100vw - 40px)"
      />
    </div>
  );

  const inner = (
    <div
      className={cn(
        "grid gap-2 lg:grid-cols-[minmax(0,23rem)_minmax(0,1fr)]",
        panelRight && "lg:grid-cols-[minmax(0,1fr)_minmax(0,23rem)]"
      )}
    >
      {panelRight ? (
        <>
          <div className="order-last lg:order-none">{screenshot}</div>
          {panel}
        </>
      ) : (
        <>
          {panel}
          {screenshot}
        </>
      )}
    </div>
  );

  return (
    <div className="container">
      {clickable && featured.url ? (
        <a
          className="group focus-ring block outline-none"
          href={featured.url}
          rel="noopener noreferrer"
          target="_blank"
        >
          <span className="sr-only">
            <VisitLabel name={featured.name} />
          </span>
          {inner}
        </a>
      ) : (
        inner
      )}
    </div>
  );
};

const CardCaption = ({
  item,
  clickable,
}: Readonly<{ item: CardView; clickable: boolean }>) => {
  const hoverText =
    clickable &&
    "group-hover:text-highlight-foreground group-focus-visible:text-highlight-foreground";
  return (
    <div className="bg-background relative flex items-center justify-between gap-3 overflow-hidden px-4 py-3">
      {clickable ? (
        <span
          aria-hidden="true"
          className="bg-highlight absolute inset-0 origin-bottom scale-y-0 group-hover:scale-y-100 group-focus-visible:scale-y-100"
        />
      ) : null}

      <div className="relative flex min-w-0 items-center gap-2">
        <AttributionMark item={item} />
        <span
          className={cn(
            "text-foreground truncate text-base leading-6 font-normal tracking-[-0.015em]",
            hoverText
          )}
        >
          {item.name}
        </span>
      </div>

      {item.category ? (
        <span
          className={cn(
            "text-muted-foreground relative shrink-0 text-base leading-6 font-normal",
            hoverText
          )}
        >
          {item.category}
        </span>
      ) : null}
    </div>
  );
};

const ShowcaseCard = ({ item }: Readonly<{ item: CardView }>) => {
  const clickable = Boolean(item.url);

  const body = (
    <div className="bg-background flex flex-col">
      <div
        className="bg-muted relative aspect-video w-full overflow-hidden before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:z-10 before:h-28 before:bg-gradient-to-b before:from-black/60 before:to-transparent before:content-['']"
        data-nav-contrast="dark"
      >
        <ScreenshotImage
          loading="lazy"
          name={item.name}
          screenshot={item.screenshot}
          sizes="(min-width: 1440px) 652px, (min-width: 640px) calc((100vw - 72px) / 2 - 32px), calc(100vw - 72px)"
        />
      </div>
      <CardCaption clickable={clickable} item={item} />
    </div>
  );

  if (clickable && item.url) {
    return (
      <a
        className="group bg-grid-dots text-foreground focus-ring flex flex-col p-4 outline-none"
        href={item.url}
        rel="noopener noreferrer"
        target="_blank"
      >
        <span className="sr-only">
          <VisitLabel name={item.name} />
        </span>
        {body}
      </a>
    );
  }

  return (
    <article className="group bg-grid-dots text-foreground flex flex-col p-4">
      {body}
    </article>
  );
};

export const ShowcaseGrid = ({
  title,
  description,
  items,
  isFirst = false,
}: Readonly<ShowcaseGridProps>) => {
  const cmsItems = items ?? [];
  // The visible heading names the region; without one, the translated label does.
  const label = title?.trim() ? null : (
    <h2 className="sr-only">
      <BlockLabel name="showcase" />
    </h2>
  );
  const allViews = cmsItems.map(cmsToView);

  const explicitFeaturedKeys = new Set(
    cmsItems.filter((item) => item.featured).map((item) => item._key)
  );
  const featuredItems =
    explicitFeaturedKeys.size > 0
      ? allViews.filter((item) => explicitFeaturedKeys.has(item.id))
      : allViews.slice(0, 1);
  const featuredIds = new Set(featuredItems.map((item) => item.id));
  const cards = allViews.filter((item) => !featuredIds.has(item.id));

  const [leadBanner, ...trailingBanners] = featuredItems;

  if (featuredItems.length === 0) {
    return (
      <section className="block-section" id="showcase">
        {label}
        <div className="container">
          <ShowcaseHeader description={description} title={title} />
        </div>
      </section>
    );
  }

  return (
    <section className="block-section" id="showcase">
      {label}
      <div className="flex flex-col gap-16">
        <div className="container">
          <ShowcaseHeader description={description} title={title} />
        </div>

        {leadBanner ? (
          <FeaturedBanner eager={isFirst} featured={leadBanner} side="left" />
        ) : null}

        {cards.length > 0 ? (
          <div className="container">
            <div className="grid gap-y-12 sm:grid-cols-2 sm:gap-x-8">
              {cards.map((item) => (
                <ShowcaseCard item={item} key={item.id} />
              ))}
            </div>
          </div>
        ) : null}

        {trailingBanners.map((item, index) => (
          <FeaturedBanner
            featured={item}
            key={item.id}
            side={index % 2 === 0 ? "right" : "left"}
          />
        ))}
      </div>
    </section>
  );
};
