import { internalPathOnly } from "@repo/blocks/lib/safe-href";
import { draftMode } from "next/headers";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/** For tooling outside the site; the preview bar exits through a Server Action. */
export const POST = async (request: NextRequest) => {
  const draft = await draftMode();
  draft.disable();
  const { origin } = request.nextUrl;
  const target = new URL(
    internalPathOnly(request.nextUrl.searchParams.get("to"), origin),
    origin
  );
  return NextResponse.redirect(
    target.origin === origin ? target : new URL("/", origin),
    303
  );
};
