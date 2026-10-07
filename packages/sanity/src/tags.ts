import type { QueryParams } from "next-sanity";

/**
 * Coarse tags on every read, for an operator purge. Normal publishes
 * invalidate exact sync tags instead, so these never fire on their own.
 */
export const CONTENT_TAG = "sanity-content";

export const siteTag = (site: string): string => `${CONTENT_TAG}:${site}`;

export const contentTags = (params?: QueryParams): string[] =>
  typeof params?.site === "string"
    ? [CONTENT_TAG, siteTag(params.site)]
    : [CONTENT_TAG];

/** The prefix `defineLive().sanityFetch` gives sync tags in the Next.js cache. */
export const SYNC_TAG_PREFIX = "sanity:";

export const syncCacheTag = (syncTag: string): string =>
  `${SYNC_TAG_PREFIX}${syncTag}`;

/**
 * Most sync tags one `/api/revalidate` request carries. The invalidation
 * Function splits larger events into batches of this size.
 */
export const MAX_SYNC_TAGS = 100;
