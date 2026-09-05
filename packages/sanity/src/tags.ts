import type { QueryParams } from "next-sanity";

/**
 * Cache tags the revalidation webhook targets. Sanity Live revalidates by the
 * Content Lake's own sync tags, which a webhook payload never carries, so every
 * read also gets one tag for all content and, when the query is scoped to a
 * site, one for that site.
 */
export const CONTENT_TAG = "sanity-content";

export const siteTag = (site: string): string => `${CONTENT_TAG}:${site}`;

export const contentTags = (params?: QueryParams): string[] =>
  typeof params?.site === "string"
    ? [CONTENT_TAG, siteTag(params.site)]
    : [CONTENT_TAG];
