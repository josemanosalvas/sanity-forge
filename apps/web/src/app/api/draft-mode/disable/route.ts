import { internalPathOnly } from "@repo/blocks/lib/safe-href";
import { draftMode } from "next/headers";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Leaves Draft Mode and returns to a same-origin path. `to` is resolved
 * against this origin and dropped if it lands anywhere else, which also
 * covers the `/\evil.com` and `/<tab>/evil.com` forms the URL parser
 * turns into other hosts. Not for `<Link>` (prefetch would trigger it).
 */
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
