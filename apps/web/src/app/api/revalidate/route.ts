import { createLogger } from "@repo/observability/log";
import { keys } from "@repo/sanity/keys";
import { parseBody } from "next-sanity/webhook";
import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const log = createLogger("revalidate");

// Cap the tag count so a caller cannot force an unbounded revalidation loop.
const MAX_TAGS = 1000;

interface WebhookBody {
  syncTags?: unknown;
}

/**
 * On-demand revalidation for a Sanity webhook (GROQ-powered webhook with
 * a projection of `{ "syncTags": ... }`). Sanity Live already keeps pages
 * fresh; this is the belt-and-braces path for environments without it.
 * Requests are verified with the shared secret and fail closed.
 */
export const POST = async (request: NextRequest) => {
  const secret = keys().SANITY_REVALIDATE_SECRET;
  if (!secret) {
    log.warn(
      "Rejected revalidation request: SANITY_REVALIDATE_SECRET is not set"
    );
    return new Response("Revalidation is not configured", { status: 501 });
  }

  const { isValidSignature, body } = await parseBody<WebhookBody>(
    request,
    secret
  );
  if (!isValidSignature) {
    log.warn("Rejected revalidation request: invalid signature");
    return new Response("Invalid signature", { status: 401 });
  }

  const syncTags = body?.syncTags;
  if (
    !Array.isArray(syncTags) ||
    syncTags.length === 0 ||
    syncTags.length > MAX_TAGS ||
    !syncTags.every((tag): tag is string => typeof tag === "string")
  ) {
    return new Response(
      "Bad Request: syncTags must be a non-empty array of strings",
      {
        status: 400,
      }
    );
  }

  for (const tag of syncTags) {
    // `sanityFetch` tags entries as `sanity:${tag}`; expire immediately.
    revalidateTag(`sanity:${tag}`, { expire: 0 });
  }

  return NextResponse.json({ revalidated: true, syncTags });
};
