import { draftMode } from "next/headers";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/** Leaves Draft Mode and returns to a same-origin path. Not for `<Link>` (prefetch would trigger it). */
export const POST = async (request: NextRequest) => {
  const draft = await draftMode();
  draft.disable();
  const to = request.nextUrl.searchParams.get("to") ?? "/";
  const safePath = to.startsWith("/") && !to.startsWith("//") ? to : "/";
  return NextResponse.redirect(new URL(safePath, request.nextUrl.origin), 303);
};
