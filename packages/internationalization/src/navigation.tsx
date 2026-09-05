"use client";

import { useLocale } from "next-intl";
import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { createContext, useContext } from "react";
import type { ComponentProps, ReactNode } from "react";

import { locales } from "./locales";
import type { Locale } from "./locales";
import { localizePath, parsePathname } from "./routing";
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

/** The browser pathname without its locale prefix (rewrites are invisible to `usePathname`). */
export const useUnlocalizedPathname = (): string => {
  const site = useSite();
  return parsePathname(site, usePathname(), locales).pathname;
};
