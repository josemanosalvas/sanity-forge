"use client";

import { useLocale } from "next-intl";
import NextLink from "next/link";
import { createContext, useContext } from "react";
import type { ComponentProps, ReactNode } from "react";

import type { Locale } from "./locales";
import { localizePath } from "./routing";
import type { Site } from "./sites";

const SiteContext = createContext<Site | null>(null);

export const SiteProvider = ({
  site,
  children,
}: {
  site: Site;
  children: ReactNode;
}) => <SiteContext.Provider value={site}>{children}</SiteContext.Provider>;

export const useSite = (): Site => {
  const site = useContext(SiteContext);
  if (!site) {
    throw new Error("useSite must be used within <SiteProvider>");
  }
  return site;
};

export const useSiteLocale = (): Locale => useLocale() as Locale;

type LinkProps = Omit<ComponentProps<typeof NextLink>, "href" | "locale"> & {
  href: string;
  locale?: Locale;
};

/** Locale-aware link: unprefixed for the site's default locale, `/{locale}/…` otherwise. */
export const Link = ({ href, locale, ...rest }: LinkProps) => {
  const site = useSite();
  const current = useSiteLocale();
  const target = locale ?? current;
  return (
    <NextLink
      href={localizePath(site, target, href)}
      hrefLang={locale ? target : undefined}
      {...rest}
    />
  );
};
