import { isSiteKey } from "@repo/internationalization/sites";
import { keys } from "@repo/sanity/keys";
import { CONTENT_TAG, siteTag } from "@repo/sanity/tags";
import { parseBody } from "next-sanity/webhook";
import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

interface WebhookBody {
  _type?: unknown;
  site?: unknown;
}

// A GROQ-powered webhook with projection `{_type, site}` also covers deletes.
export const POST = async (request: NextRequest) => {
  const secret = keys().SANITY_REVALIDATE_SECRET;
  if (!secret) {
    return new Response("Revalidation is not configured", { status: 501 });
  }

  let parsed;
  try {
    parsed = await parseBody<WebhookBody>(request, secret);
  } catch {
    return new Response("Invalid webhook body", { status: 400 });
  }
  const { isValidSignature, body } = parsed;
  if (!isValidSignature) {
    return new Response("Invalid signature", { status: 401 });
  }
  if (typeof body?._type !== "string" || !body._type) {
    return new Response("Bad Request: _type is required", { status: 400 });
  }

  // Site documents invalidate their site; shared documents invalidate all sites.
  // The max profile serves stale content while revalidating.
  const tag = isSiteKey(body.site) ? siteTag(body.site) : CONTENT_TAG;
  revalidateTag(tag, "max");

  return NextResponse.json({ revalidated: true, tag });
};
