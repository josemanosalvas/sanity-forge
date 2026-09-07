import { isSiteKey } from "@repo/internationalization/sites";
import { keys } from "@repo/sanity/keys";
import { CONTENT_TAG, siteTag } from "@repo/sanity/tags";
import { parseBody } from "next-sanity/webhook";
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

const webhookBody = z.object({
  _type: z.string().min(1),
  // Missing or unknown sites invalidate all sites.
  site: z.unknown().optional(),
});

const LOG_TAG = "[api/revalidate]";

/** Validate here so a short secret disables only the webhook. */
const MIN_SECRET_LENGTH = 32;

const FAILURE_BUDGET = { limit: 30, windowMs: 60_000 };

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
  const failed = (message: string) => {
    // Fixed strings only: the body is unauthenticated input.
    console.warn(`${LOG_TAG} ${message}`);
    if (key) {
      recordFailure(key, FAILURE_BUDGET);
    }
  };

  let parsed;
  try {
    parsed = await parseBody<unknown>(request, secret);
  } catch {
    failed("could not read the webhook body");
    return new Response("Invalid webhook body", { status: 400 });
  }
  if (!parsed.isValidSignature) {
    failed("rejected a request with an invalid signature");
    return new Response("Invalid signature", { status: 401 });
  }

  const body = webhookBody.safeParse(parsed.body);
  if (!body.success) {
    console.warn(`${LOG_TAG} rejected a signed payload without _type`);
    return new Response("Bad Request: _type is required", { status: 400 });
  }

  // Site documents invalidate their site; shared documents invalidate all sites.
  // The max profile serves stale content while revalidating.
  const tag = isSiteKey(body.data.site) ? siteTag(body.data.site) : CONTENT_TAG;
  try {
    revalidateTag(tag, "max");
  } catch (error) {
    console.error(`${LOG_TAG} revalidation failed for ${tag}:`, error);
    return new Response("Server error", { status: 500 });
  }

  return NextResponse.json({ revalidated: true, tag });
};
