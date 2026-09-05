import { siteKeys } from "@repo/internationalization/sites";
import { keys } from "@repo/sanity/keys";
import { parseBody } from "next-sanity/webhook";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

interface WebhookBody {
  _type?: unknown;
}

// A GROQ-powered webhook with projection `{_type}` also covers deletes.
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

  // Shared FAQs, assets and translations can affect multiple sites. Use the
  // internal route pattern, because revalidatePath does not run the proxy.
  revalidatePath("/[site]/[locale]", "layout");
  for (const site of siteKeys) {
    revalidatePath(`/sitemap/${site}.xml`);
  }

  return NextResponse.json({ revalidated: true });
};
