import { compiledQuery } from "groq-compiler/sanity";
import type { QueryParams } from "next-sanity";
import {
  defineLive,
  resolvePerspectiveFromCookies,
  resolveVariantFromCookies,
} from "next-sanity/live";
import type { LivePerspective } from "next-sanity/live";
import { cookies, draftMode } from "next/headers";

import { client } from "./client";
import { compiledQueries } from "./compiled-queries";
import { keys } from "./keys";
import { contentTags, SYNC_TAG_PREFIX } from "./tags";
import { token } from "./token";

// Equivalent text proven with groq-js at `pnpm typegen`; result types stay keyed by the original query.
const useCompiledQueries = keys().SANITY_COMPILED_QUERIES === "true";

const live = defineLive({
  // Shared with the browser only for validated Draft Mode sessions.
  browserToken: token,
  client,
  // Server-only: lets sanityFetch read drafts and releases.
  serverToken: token,
  // Every fetch names its perspective and stega explicitly, so cached scopes
  // never depend on cookies.
  strict: true,
});

export const { SanityLive } = live;

type SanityFetch = typeof live.sanityFetch;

const logReads = keys().SANITY_LOG_READS;

/**
 * Add webhook tags while preserving next-sanity overloads and stega result types. With
 * `SANITY_COMPILED_QUERIES=true`, send each query's compiled text instead.
 */
export const sanityFetch = (async (options: Parameters<SanityFetch>[0]) => {
  const params = await options.params;
  const result = await live.sanityFetch({
    ...options,
    params,
    query: useCompiledQueries
      ? compiledQuery(compiledQueries, options.query)
      : options.query,
    tags: [...(options.tags ?? []), ...contentTags(params)],
  });
  // Reads run inside `use cache`, so each line is one cache miss.
  if (logReads) {
    const syncTags = result.tags
      .filter((tag) => tag.startsWith(SYNC_TAG_PREFIX))
      .map((tag) => tag.slice(SYNC_TAG_PREFIX.length));
    const query = options.query.replaceAll(/\s+/gu, " ").slice(0, 60);
    console.info(
      `[sanity] read perspective=${options.perspective} params=${JSON.stringify(params ?? {})} syncTags=${syncTags.join(",")} query=${query}`
    );
  }
  return result;
}) as SanityFetch;

export interface DynamicFetchOptions {
  perspective: LivePerspective;
  stega: boolean;
  /** Editing variant Presentation is previewing, from its cookie. */
  variant?: string;
}

/** Read preview cookies outside use cache and pass the resolved options in. */
export const getDynamicFetchOptions =
  async (): Promise<DynamicFetchOptions> => {
    const { isEnabled: isDraftMode } = await draftMode();
    if (!isDraftMode) {
      return { perspective: "published", stega: false };
    }

    const jar = await cookies();
    const [perspective, variant] = await Promise.all([
      resolvePerspectiveFromCookies({ cookies: jar }),
      resolveVariantFromCookies({ cookies: jar }),
    ]);
    return { perspective: perspective ?? "drafts", stega: true, variant };
  };

// For usage within `generateStaticParams`
export const sanityFetchStaticParams = async <
  const QueryString extends string,
>({
  query,
  params = {},
}: {
  query: QueryString;
  params?: QueryParams;
}) => {
  "use cache";
  const { data } = await sanityFetch({
    params,
    perspective: "published",
    query,
    stega: false,
  });
  return { data };
};

// For usage within `generateMetadata`, `generateViewport` and metadata routes.
export const sanityFetchMetadata = async <const QueryString extends string>({
  query,
  params = {},
  perspective,
  variant,
}: {
  query: QueryString;
  params?: QueryParams;
  perspective: LivePerspective;
  variant?: string;
}) => {
  "use cache";
  const { data } = await sanityFetch({
    params,
    perspective,
    query,
    stega: false,
    variant,
  });
  return { data };
};
