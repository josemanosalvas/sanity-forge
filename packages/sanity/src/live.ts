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

/**
 * Sanity Live for Cache Components. `sanityFetch` tags and gives a lifetime
 * to the surrounding `'use cache'` scope itself; `<SanityLive>` in the root
 * layout revalidates those tags as content changes.
 */
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

/**
 * `sanityFetch` with the content tags from `./tags` added to every read, so
 * the revalidation webhook can invalidate one site's content, or all of it,
 * when no browser has Sanity Live open. The cast keeps next-sanity's
 * overloads, which brand the result as stega-encoded when `stega` is `true`.
 */
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

/**
 * Resolves `perspective`, `stega` and `variant` outside any `'use cache'`
 * boundary so they can be passed in as plain props. Reads `cookies()` only
 * when Draft Mode is on, so published renders stay in the static shell.
 */
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

// For usage within `generateMetadata`, `generateViewport` and metadata routes
export const sanityFetchMetadata = async <const QueryString extends string>({
  query,
  params = {},
  perspective,
}: {
  query: QueryString;
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
  return { data };
};
