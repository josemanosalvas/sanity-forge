import type { QueryParams } from "next-sanity";

/** Webhook tags supplement Sanity Live sync tags, which webhook payloads lack. */
export const CONTENT_TAG = "sanity-content";

export const siteTag = (site: string): string => `${CONTENT_TAG}:${site}`;

export const contentTags = (params?: QueryParams): string[] =>
  typeof params?.site === "string"
    ? [CONTENT_TAG, siteTag(params.site)]
    : [CONTENT_TAG];
