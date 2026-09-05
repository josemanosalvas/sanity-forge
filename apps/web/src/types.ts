import type { Locale } from "@repo/internationalization/locales";
import type { Site } from "@repo/internationalization/sites";
import type { PageQueryResult } from "@repo/sanity/types";
import type { FilterByType, Get } from "@sanity/codegen";

import type {
  fetchFooter,
  fetchNavigation,
  fetchPage,
  fetchSettings,
} from "@/lib/content";

/** The resolved site and locale of the current request, plus the site's default locale. */
export interface SiteContext {
  readonly site: Site;
  readonly locale: Locale;
  readonly defaultLocale: Locale;
}

/** Query parameters every site-aware query takes. */
export interface SiteQueryParams {
  readonly site: Site["key"];
  readonly locale: Locale;
  readonly defaultLocale: Locale;
}

/** A page as `generateMetadata` reads it: never stega-encoded. */
export type PageDocument = NonNullable<PageQueryResult>;

/**
 * Rendered data comes from the `fetch*` helpers, whose `stega` flag is a
 * runtime value, so every string is typed as possibly stega-encoded.
 */
export type PageData = NonNullable<Awaited<ReturnType<typeof fetchPage>>>;

export type SettingsData = Awaited<ReturnType<typeof fetchSettings>>;

export type PageBuilderBlock = Get<PageData, "pageBuilder", number>;

type PageBuilderBlockTypes = NonNullable<PageBuilderBlock>["_type"];

export type PagebuilderType<T extends PageBuilderBlockTypes> = FilterByType<
  NonNullable<PageBuilderBlock>,
  T
>;

export type NavigationData = Awaited<ReturnType<typeof fetchNavigation>>;

export type FooterData = Awaited<ReturnType<typeof fetchFooter>>;
