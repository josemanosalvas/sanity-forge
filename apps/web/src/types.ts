import type { Locale } from "@repo/internationalization/locales";
import type { Site } from "@repo/internationalization/sites";
import type {
  FooterQueryResult,
  NavigationQueryResult,
  PageQueryResult,
  SettingsQueryResult,
} from "@repo/sanity/types";
import type { FilterByType, Get } from "@sanity/codegen";

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

export type PageData = NonNullable<PageQueryResult>;

export type PageBuilderBlock = Get<PageQueryResult, "pageBuilder", number>;

type PageBuilderBlockTypes = NonNullable<PageBuilderBlock>["_type"];

export type PagebuilderType<T extends PageBuilderBlockTypes> = FilterByType<
  NonNullable<PageBuilderBlock>,
  T
>;

export type PageTranslation = NonNullable<
  NonNullable<PageQueryResult>["translations"]
>[number];

export interface NavigationData {
  readonly navigation: NavigationQueryResult;
  readonly settings: SettingsQueryResult;
}

export type FooterData = FooterQueryResult;

export type NavigationColumn = Get<NavigationQueryResult, "columns", number>;

export type ColumnLink = Extract<
  NavigationColumn,
  { type: "column" }
>["links"] extends (infer T)[] | null
  ? T
  : never;
