import { localeLabels } from "@repo/internationalization/locales";
import type { Locale } from "@repo/internationalization/locales";
import { getSiteOrigin } from "@repo/internationalization/sites";
import type { Site, SiteEnvironment } from "@repo/internationalization/sites";

import { env } from "../env";

/**
 * Which environment's origins Presentation and the slug preview should open.
 * `sanity dev` previews the local web app, `sanity build` the production
 * sites; override with SANITY_STUDIO_PREVIEW_ENVIRONMENT for staging setups.
 */
export const previewEnvironment: SiteEnvironment =
  env.SANITY_STUDIO_PREVIEW_ENVIRONMENT ??
  (process.env.NODE_ENV === "development" ? "development" : "production");

export const previewOrigin = (site: Site): string =>
  getSiteOrigin(site, previewEnvironment);

export const languageOptions = (locales: readonly Locale[]) =>
  locales.map((id) => ({ id, title: localeLabels[id] }));
