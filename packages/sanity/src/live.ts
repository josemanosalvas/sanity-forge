import type { ClientReturn, ContentSourceMap, QueryParams } from "next-sanity";
import {
  defineLive,
  resolvePerspectiveFromCookies,
  resolveVariantFromCookies,
} from "next-sanity/live";
import type { LivePerspective } from "next-sanity/live";
import { cacheTag } from "next/cache";
import { cookies, draftMode } from "next/headers";

import { keys } from "../keys";
import { client } from "./client";

const token = keys().SANITY_API_READ_TOKEN;

const live = defineLive({
  // Shared with the browser only for validated Draft Mode sessions.
  browserToken: token ?? false,
  client,
  // Server-only: lets sanityFetch read drafts/releases and stega-encode when
  // the perspective is not `published`. Without a token the site is
  // published-only and draft mode stays off.
  serverToken: token ?? false,
  // Every fetch names its perspective and stega explicitly, because
  // draftMode()/cookies() cannot be read inside a `'use cache'` boundary.
  strict: true,
});

export const { SanityLive } = live;

const liveFetch = live.sanityFetch;

export interface SanityFetchOptions<Query extends string> {
  query: Query;
  params?: QueryParams;
  perspective: LivePerspective;
  variant?: string;
  stega: boolean;
  tags?: string[];
  requestTag?: string;
}

export interface SanityFetchResult<Query extends string> {
  data: ClientReturn<Query, unknown>;
  sourceMap: ContentSourceMap | null;
  tags: string[];
}

/**
 * `sanityFetch` with two Forge-specific behaviours:
 *
 * 1. The query's sync tags are registered on the surrounding `'use cache'`
 *    entry. Under Turbopack, next-sanity only tags the underlying `fetch`,
 *    which never reaches the cache entry, so `updateTag()` from `<SanityLive>`
 *    would have nothing to invalidate. Tagging here is idempotent.
 * 2. `data` keeps the clean TypeGen type whether or not stega is on. Callers
 *    pass a runtime `stega` flag (published vs. draft-mode renders share one
 *    cached reader), which would otherwise brand every string as
 *    `StegaString`. The default stega filter never encodes `_type`, `type`,
 *    `variant`, `href`, `language` or slugs, which are the only fields the
 *    apps compare to literals; user-facing copy is rendered, not compared.
 *    Use `stegaClean` before comparing any other string in draft mode.
 */
export const sanityFetch = async <const Query extends string>(
  options: SanityFetchOptions<Query>
): Promise<SanityFetchResult<Query>> => {
  const result = await liveFetch(options);
  if (result.tags.length > 0) {
    cacheTag(...result.tags);
  }
  return result as SanityFetchResult<Query>;
};

export { stegaClean } from "next-sanity";

export interface DynamicFetchOptions {
  perspective: LivePerspective;
  variant?: string;
  stega: boolean;
}

export const PUBLISHED_FETCH_OPTIONS = {
  perspective: "published",
  stega: false,
} as const satisfies DynamicFetchOptions;

/**
 * Perspective, variant and stega for the current request. Reads draftMode()
 * and cookies(), so it must run outside any `'use cache'` boundary.
 *
 * Drafts render in any environment, production included, but only for a
 * request holding a validated draft-mode session. That is what lets the
 * deployed Studio preview the production site.
 */
export const getDynamicFetchOptions =
  async (): Promise<DynamicFetchOptions> => {
    const { isEnabled } = await draftMode();
    if (!isEnabled) {
      return PUBLISHED_FETCH_OPTIONS;
    }
    const jar = await cookies();
    const [perspective, variant] = await Promise.all([
      resolvePerspectiveFromCookies({ cookies: jar }),
      resolveVariantFromCookies({ cookies: jar }),
    ]);
    return { perspective: perspective ?? "drafts", stega: true, variant };
  };

/** For generateStaticParams, sitemaps and robots: always published, never stega. */
export const sanityFetchStatic = async <const Q extends string>({
  query,
  params = {},
}: {
  query: Q;
  params?: QueryParams;
}) => {
  "use cache";
  const { data } = await sanityFetch({
    params,
    perspective: "published",
    query,
    stega: false,
  });
  return data;
};

/** For generateMetadata: honours the request perspective, never stega. */
export const sanityFetchMetadata = async <const Q extends string>({
  query,
  params = {},
  perspective,
}: {
  query: Q;
  params?: QueryParams;
  perspective: LivePerspective;
}) => {
  "use cache";
  const { data } = await sanityFetch({
    params,
    perspective,
    query,
    stega: false,
  });
  return data;
};
