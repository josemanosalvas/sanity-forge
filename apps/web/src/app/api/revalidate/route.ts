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

  // Every read is tagged by `@repo/sanity/live`. A document that belongs to
  // one site only affects that site's reads; anything else (FAQs, assets,
  // translation metadata) can be referenced from any site. `"max"` serves the
  // stale version while the next request revalidates, as Sanity Live does.
  const tag = isSiteKey(body.site) ? siteTag(body.site) : CONTENT_TAG;
  revalidateTag(tag, "max");

  return NextResponse.json({ revalidated: true, tag });
};
