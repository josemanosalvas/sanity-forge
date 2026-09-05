import { ArrowRight } from "lucide-react";
import { stegaClean } from "next-sanity";
import Link from "next/link";
import type { ComponentType } from "react";

import { BlockHeader } from "../components/block-header";
import {
  FacebookIcon,
  GithubIcon,
  InstagramBrandIcon,
  LinkedinBrandIcon,
  RedditBrandIcon,
  SlackIcon,
  XLogoIcon,
  YoutubeIcon,
} from "../components/icons";
import { SanityImage } from "../components/sanity-image";
import type { SanityImageData } from "../components/sanity-image";
import { sanitizeHref } from "../lib/safe-href";

export interface SocialGridItem {
  _key: string;
  platform?: string | null;
  label?: string | null;
  logo?: SanityImageData | null;
  href?: string | null;
  openInNewTab?: boolean | null;
}

export interface SocialGridProps {
  eyebrow?: string | null;
  title?: string | null;
  subtitle?: string | null;
  socials?: SocialGridItem[] | null;
}

type IconProps = Readonly<{ className?: string }>;

const PLATFORM_ICONS: Record<string, ComponentType<IconProps>> = {
  facebook: FacebookIcon,
  github: GithubIcon,
  instagram: InstagramBrandIcon,
  linkedin: LinkedinBrandIcon,
  reddit: RedditBrandIcon,
  slack: SlackIcon,
  x: XLogoIcon,
  youtube: YoutubeIcon,
};

const SocialCard = ({ social }: Readonly<{ social: SocialGridItem }>) => {
  const { platform, label, logo, openInNewTab } = social;
  const href = sanitizeHref(social.href);
  // stegaClean: `platform` is not on the default stega denylist, so in
  // Presentation the raw value carries invisible characters and the lookup
  // misses — no icons in preview, icons in production.
  const key = stegaClean(platform);
  const Icon = key ? PLATFORM_ICONS[key] : undefined;
  const displayLabel = label ?? platform ?? "";

  const iconMedia = Icon ? (
    <Icon className="h-[42px] w-auto fill-current" />
  ) : null;
  const media = logo?.id ? (
    <span className="flex h-[42px] shrink-0 items-center justify-center">
      <SanityImage
        className="h-[42px] w-auto max-w-full object-contain opacity-90 invert group-hover:invert-0 dark:invert-0"
        height={42}
        image={logo}
        width={47}
      />
    </span>
  ) : (
    iconMedia
  );

  const card = (
    <div className="group text-foreground hover:bg-highlight relative min-h-[260px] overflow-hidden transition-colors sm:aspect-[360/248] sm:min-h-0">
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <span className="bg-background text-foreground relative flex size-[100px] items-center justify-center transition-colors duration-200 group-hover:bg-black group-hover:text-white">
          <span
            aria-hidden="true"
            className="border-highlight-foreground absolute -top-3 -left-3 size-2 border-r border-b opacity-0 transition-opacity duration-200 group-hover:opacity-100"
          />
          <span
            aria-hidden="true"
            className="border-highlight-foreground absolute -top-3 -right-3 size-2 border-b border-l opacity-0 transition-opacity duration-200 group-hover:opacity-100"
          />
          <span
            aria-hidden="true"
            className="border-highlight-foreground absolute -bottom-3 -left-3 size-2 border-t border-r opacity-0 transition-opacity duration-200 group-hover:opacity-100"
          />
          <span
            aria-hidden="true"
            className="border-highlight-foreground absolute -right-3 -bottom-3 size-2 border-t border-l opacity-0 transition-opacity duration-200 group-hover:opacity-100"
          />
          {media}
        </span>
      </div>
      <span className="bg-background text-foreground dark:group-hover:bg-background dark:group-hover:text-foreground absolute bottom-2 left-2 flex max-w-[calc(100%-1rem)] items-center px-[5px] py-[4px] font-mono text-sm leading-none font-light uppercase transition-colors duration-200 group-hover:bg-black group-hover:text-white sm:py-[2.5px]">
        <span className="min-w-0 truncate">{displayLabel}</span>
        {href ? (
          <ArrowRight
            aria-hidden="true"
            className="h-4 w-0 shrink-0 overflow-hidden opacity-0 transition-all duration-200 group-hover:ml-1 group-hover:w-4 group-hover:opacity-100"
          />
        ) : null}
      </span>
    </div>
  );

  if (href) {
    return (
      <Link
        className="focus-ring-inset block focus-visible:[outline-style:solid]!"
        href={href}
        rel={openInNewTab ? "noopener noreferrer" : undefined}
        target={openInNewTab ? "_blank" : undefined}
      >
        {card}
      </Link>
    );
  }

  return card;
};

export const SocialGrid = ({
  eyebrow,
  title,
  subtitle,
  socials,
}: Readonly<SocialGridProps>) => {
  if (!(Array.isArray(socials) && socials.length > 0)) {
    return null;
  }

  return (
    <section className="block-section" id="socials">
      <div className="container">
        <BlockHeader eyebrow={eyebrow} title={title}>
          {subtitle ? (
            <p className="body-text text-muted-foreground max-w-xl">
              {subtitle}
            </p>
          ) : null}
        </BlockHeader>
        <div className="bleed-x bg-grid-dots bg-background mt-12 grid grid-cols-1 bg-size-[5.7px_6px] text-zinc-800 sm:grid-cols-2 md:mt-16 lg:grid-cols-4 dark:text-zinc-50">
          {socials.map((social) => (
            <SocialCard key={social._key} social={social} />
          ))}
        </div>
      </div>
    </section>
  );
};
