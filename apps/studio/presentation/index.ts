import { isLocale } from "@repo/internationalization/locales";
import { absoluteUrl } from "@repo/internationalization/routing";
import {
  getAllSiteOrigins,
  getDefaultLocale,
  getSiteOrDefault,
  resolveSiteFromHost,
  siteSupportsLocale,
} from "@repo/internationalization/sites";
import type { Site } from "@repo/internationalization/sites";
import { defineDocuments, defineLocations } from "sanity/presentation";
import type { PresentationPluginOptions } from "sanity/presentation";

import { previewOrigin } from "../lib/site";

const originToSiteKey = (origin: string) =>
  URL.canParse(origin)
    ? resolveSiteFromHost(new URL(origin).host)?.key
    : undefined;

/** Where a page lives on its own site, in its own language. */
const pageHref = (doc: {
  site?: string | null;
  language?: string | null;
  slug?: string | null;
}) => {
  const site = getSiteOrDefault(doc.site);
  const locale = isLocale(doc.language) ? doc.language : getDefaultLocale(site);
  return absoluteUrl(previewOrigin(site), site, locale, doc.slug || "/");
};

const locations: PresentationPluginOptions["resolve"] = {
  locations: {
    footer: defineLocations({
      resolve: (doc) => ({
        locations: [{ href: pageHref({ ...doc, slug: "/" }), title: "Home" }],
        message: "The footer is shown on every page of this site",
        tone: "positive",
      }),
      select: { language: "language", site: "site" },
    }),
    navigation: defineLocations({
      resolve: (doc) => ({
        locations: [{ href: pageHref({ ...doc, slug: "/" }), title: "Home" }],
        message: "The navigation is shown on every page of this site",
        tone: "positive",
      }),
      select: { language: "language", site: "site" },
    }),
    page: defineLocations({
      resolve: (doc) => ({
        locations: [
          {
            href: pageHref(doc ?? {}),
            title: doc?.title || "Untitled",
          },
        ],
      }),
      select: {
        language: "language",
        site: "site",
        slug: "slug.current",
        title: "title",
      },
    }),
    settings: defineLocations({
      resolve: (doc) => ({
        locations: [{ href: pageHref({ ...doc, slug: "/" }), title: "Home" }],
        message: "Site settings apply to every page of this site",
        tone: "positive",
      }),
      select: { site: "site" },
    }),
  },
};

/**
 * Presentation for one site. Every known origin (all sites, all environments)
 * is allowed, so an editor can follow a link across sites inside the preview;
 * the initial URL opens this workspace's own site.
 */
export const createPresentationConfig = (
  site: Site
): PresentationPluginOptions => ({
  allowOrigins: getAllSiteOrigins(),
  name: "presentation",
  previewUrl: {
    initial: previewOrigin(site),
    previewMode: {
      enable: "/api/draft-mode/enable",
    },
  },
  resolve: {
    ...locations,
    mainDocuments: defineDocuments([
      {
        resolve: ({ origin, path }) => {
          const resolved = getSiteOrDefault(originToSiteKey(origin));
          const [, first = "", ...rest] = path.split("/");
          const hasLocale = siteSupportsLocale(resolved, first);
          const locale = hasLocale ? first : getDefaultLocale(resolved);
          const slug = hasLocale ? `/${rest.join("/")}` : path || "/";
          return {
            filter:
              '_type == "page" && site == $site && language == $locale && slug.current == $slug',
            params: {
              locale,
              site: resolved.key,
              slug: slug === "" ? "/" : slug,
            },
          };
        },
        // Any path on any site: the site comes from the preview origin and
        // the language from the path, so the resolved document is always the
        // one the visitor would see there.
        route: "/:path*",
      },
    ]),
  },
  title: "Preview",
});
