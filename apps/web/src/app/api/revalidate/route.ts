import { createHash, timingSafeEqual } from "node:crypto";

import { isSiteKey } from "@repo/internationalization/sites";
import { keys } from "@repo/sanity/keys";
import {
  CONTENT_TAG,
  MAX_SYNC_TAGS,
  SYNC_TAG_PREFIX,
  siteTag,
  syncCacheTag,
} from "@repo/sanity/tags";
import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { z } from "zod";

import {
  checkRateLimit,
  clientAddress,
  recordFailure,
  tooManyRequests,
} from "@/lib/rate-limit";

const LOG_TAG = "[api/revalidate]";

/** Validate here so a short secret disables only this route. */
const MIN_SECRET_LENGTH = 32;

const FAILURE_BUDGET = { limit: 30, windowMs: 60_000 };

/** Next.js ignores cache tags longer than 256 characters. */
const syncTag = z
  .string()
  .regex(/^[!-~]+$/u)
  .max(256 - SYNC_TAG_PREFIX.length);

/** Room for MAX_SYNC_TAGS tags of the longest accepted length. */
const MAX_BODY_BYTES = 32 * 1024;

const requestBody = z.union([
  // From the invalidate-tags Function: exact sync tags.
  z.strictObject({
    syncTags: z.array(syncTag).min(1).max(MAX_SYNC_TAGS),
  }),
  // From an operator: every read, or one site's reads.
  z.strictObject({
    purge: z.literal(true),
    site: z.string().refine(isSiteKey).optional(),
  }),
]);

const digest = (value: string) => createHash("sha256").update(value).digest();

/** Hashing first gives equal-length buffers, so the comparison time is constant. */
const isAuthorized = (header: string | null, secret: string) =>
  header?.startsWith("Bearer ") === true &&
  timingSafeEqual(digest(header.slice("Bearer ".length)), digest(secret));

/** Returns null once the body exceeds `limit` bytes, without reading the rest. */
const readText = async (
  request: NextRequest,
  limit: number
): Promise<string | null> => {
  if (Number(request.headers.get("content-length")) > limit) {
    return null;
  }
  if (!request.body) {
    return "";
  }
  const chunks: Uint8Array[] = [];
  let size = 0;
  for await (const chunk of request.body) {
    size += chunk.byteLength;
    if (size > limit) {
      return null;
    }
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString("utf-8");
};

const parseJson = (text: string): unknown => {
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
};

export const POST = async (request: NextRequest) => {
  const secret = keys().SANITY_REVALIDATE_SECRET;
  if (!secret) {
    return new Response("Revalidation is not configured", { status: 501 });
  }
  if (secret.length < MIN_SECRET_LENGTH) {
    console.error(
      `${LOG_TAG} SANITY_REVALIDATE_SECRET must be at least ${MIN_SECRET_LENGTH} characters; refusing to revalidate`
    );
    return new Response("Revalidation is not configured", { status: 501 });
  }

  const address = clientAddress(request.headers);
  const key = address ? `revalidate:${address}` : null;
  const limit = key ? checkRateLimit(key, FAILURE_BUDGET) : null;
  if (limit && !limit.ok) {
    return tooManyRequests(limit);
  }

  if (!isAuthorized(request.headers.get("authorization"), secret)) {
    console.warn(`${LOG_TAG} rejected reason=unauthorized`);
    if (key) {
      recordFailure(key, FAILURE_BUDGET);
    }
    return new Response("Unauthorized", { status: 401 });
  }

  // Authenticated from here on, so failures no longer consume the budget.
  const text = await readText(request, MAX_BODY_BYTES);
  if (text === null) {
    console.warn(`${LOG_TAG} rejected reason=too-large`);
    return new Response("Payload too large", { status: 413 });
  }
  const body = requestBody.safeParse(parseJson(text));
  if (!body.success) {
    console.warn(`${LOG_TAG} rejected reason=invalid-body`);
    return new Response("Bad Request", { status: 400 });
  }

  // The max profile serves stale content while the next request revalidates.
  if ("syncTags" in body.data) {
    const tags = [...new Set(body.data.syncTags)].map(syncCacheTag);
    try {
      for (const tag of tags) {
        revalidateTag(tag, "max");
      }
    } catch (error) {
      console.error(`${LOG_TAG} revalidation failed:`, error);
      return new Response("Server error", { status: 500 });
    }
    console.info(`${LOG_TAG} accepted kind=sync-tags tags=${tags.length}`);
    return NextResponse.json({ revalidated: tags });
  }

  const tag = body.data.site ? siteTag(body.data.site) : CONTENT_TAG;
  try {
    revalidateTag(tag, "max");
  } catch (error) {
    console.error(`${LOG_TAG} purge failed for ${tag}:`, error);
    return new Response("Server error", { status: 500 });
  }
  console.info(`${LOG_TAG} accepted kind=purge tag=${tag}`);
  return NextResponse.json({ revalidated: [tag] });
};
