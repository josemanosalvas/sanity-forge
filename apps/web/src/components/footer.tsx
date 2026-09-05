import {
  FacebookIcon,
  InstagramBrandIcon,
  LinkedinBrandIcon,
  RedditBrandIcon,
  XBrandIcon,
  YoutubeIcon,
} from "@repo/blocks/internal/icons";
import { normalizedLogoHeight } from "@repo/blocks/internal/logo-height";
import { SanityImage } from "@repo/blocks/internal/sanity-image";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { Fragment } from "react";

import { Logo } from "@/components/logo";
import type { FooterData, SettingsData, SiteContext } from "@/types";

const SocialLinks = ({
  data,
}: {
  data: NonNullable<SettingsData>["socialLinks"];
}) => {
  if (!data) {
    return null;
  }
  const links = [
    { Icon: InstagramBrandIcon, label: "Instagram", url: data.instagram },
    { Icon: FacebookIcon, label: "Facebook", url: data.facebook },
    { Icon: XBrandIcon, label: "X", url: data.twitter },
    { Icon: LinkedinBrandIcon, label: "LinkedIn", url: data.linkedin },
    { Icon: YoutubeIcon, label: "YouTube", url: data.youtube },
    { Icon: RedditBrandIcon, label: "Reddit", url: data.reddit },
  ].filter((link): link is typeof link & { url: string } => Boolean(link.url));

  if (!links.length) {
    return null;
  }

  return (
    <ul className="-mx-1.5 flex items-center">
      {links.map(({ url, Icon, label }) => (
        <li key={label}>
          <a
            aria-label={label}
            className="focus-ring-inset group inline-flex items-center justify-center p-1.5"
            href={url}
            rel="noopener noreferrer"
            target="_blank"
          >
            <Icon className="fill-foreground h-[18px] w-auto transition-opacity duration-200 group-hover:opacity-75" />
          </a>
        </li>
      ))}
    </ul>
  );
};

export const Footer = async ({
  context,
  footer,
  settings,
}: {
  context: SiteContext;
  footer: FooterData;
  settings: SettingsData;
}) => {
  const t = await getTranslations("footer");
  const siteName = settings?.siteTitle ?? context.site.name;
  const year = new Date().getFullYear();
  const logo = settings?.logos?.footerLogo ?? settings?.logos?.logo;

  return (
    <footer className="border-border bg-background border-t">
      <div className="container flex flex-col gap-10 py-12 lg:flex-row lg:justify-between">
        <div className="flex max-w-sm flex-col gap-6">
          <Logo
            alt={siteName}
            className="h-5 w-auto object-left"
            image={logo}
            priority={false}
          />
          {footer?.subtitle && (
            <p className="text-muted-foreground text-sm">{footer.subtitle}</p>
          )}
          <SocialLinks data={settings?.socialLinks ?? null} />
        </div>
        {footer?.columns?.length ? (
          <div className="grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-4 sm:gap-14">
            {footer.columns.map((column) => (
              <div key={column._key}>
                <h3 className="text-muted-foreground mb-2 font-mono text-sm tracking-[0.28px] uppercase">
                  {column.title}
                </h3>
                <ul className="space-y-1 text-sm leading-6">
                  {column.links?.map((link) =>
                    link.href ? (
                      <li key={link._key}>
                        <Link
                          className="link-underline focus-ring"
                          href={link.href}
                          rel={
                            link.openInNewTab
                              ? "noopener noreferrer"
                              : undefined
                          }
                          target={link.openInNewTab ? "_blank" : undefined}
                        >
                          {link.name}
                        </Link>
                      </li>
                    ) : null
                  )}
                </ul>
              </div>
            ))}
          </div>
        ) : null}
      </div>
      <div className="border-border text-muted-foreground container flex flex-col gap-4 border-t py-6 text-sm sm:flex-row sm:items-center sm:justify-between">
        <p>{footer?.copyright ?? t("copyright", { siteName, year })}</p>
        {footer?.credits?.length ? (
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            {footer.credits.map((credit, index) => {
              const logoHeight = normalizedLogoHeight(credit.logo, {
                base: 34,
                max: 18,
                min: 11,
              });
              const content = (
                <span className="flex items-center gap-1 whitespace-nowrap">
                  {credit.label}
                  {credit.logo?.id && (
                    <SanityImage
                      className="w-auto max-w-none object-contain"
                      height={logoHeight}
                      image={credit.logo}
                      loading="lazy"
                      style={{ height: logoHeight }}
                      width={75}
                    />
                  )}
                </span>
              );
              return (
                <Fragment key={credit._key}>
                  {index > 0 && (
                    <span
                      aria-hidden="true"
                      className="bg-border hidden h-4 w-px sm:block"
                    />
                  )}
                  {credit.url ? (
                    <a
                      className="focus-ring hover:opacity-80"
                      href={credit.url}
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      {content}
                    </a>
                  ) : (
                    content
                  )}
                </Fragment>
              );
            })}
          </div>
        ) : null}
      </div>
    </footer>
  );
};
