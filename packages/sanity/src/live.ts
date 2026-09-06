import type { QueryParams } from "next-sanity";
import {
  defineLive,
  resolvePerspectiveFromCookies,
  resolveVariantFromCookies,
} from "next-sanity/live";
import type { LivePerspective } from "next-sanity/live";
import { cookies, draftMode } from "next/headers";

import { client } from "./client";
import { contentTags } from "./tags";
import { token } from "./token";

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

/** Add webhook tags while preserving next-sanity overloads and stega result types. */
export const sanityFetch = (async (options: Parameters<SanityFetch>[0]) => {
  const params = await options.params;
  return live.sanityFetch({
    ...options,
    params,
    tags: [...(options.tags ?? []), ...contentTags(params)],
  });
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
// Never stega-encoded: invisible characters must not reach the head.
export const sanityFetchMetadata = async <const QueryString extends string>({
  query,
  params = {},
  perspective,
  variant,
}: {
  query: QueryString;
  params?: QueryParams;
  perspective: LivePerspective;
  /** Editing variant Presentation is previewing, so preview metadata tracks the previewed release. */
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
