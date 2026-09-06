import { client } from "@repo/sanity/client";
import { defineEnableDraftMode } from "next-sanity/draft-mode";

import {
  checkRateLimit,
  clientAddress,
  recordFailure,
  tooManyRequests,
} from "@/lib/rate-limit";

const { GET: enableDraftMode } = defineEnableDraftMode({ client });

/** Failed handshakes a single address may attempt per minute; valid ones are never counted. */
const FAILURE_BUDGET = { limit: 20, windowMs: 60_000 };

/**
 * Every call validates a preview secret against the Sanity API, so the
 * limiter keeps a scanner from turning the handshake into a request loop
 * without ever throttling editors, whose handshakes succeed.
 */
export const GET = async (request: Request): Promise<Response> => {
  const address = clientAddress(request.headers);
  const key = address ? `draft-mode:${address}` : null;
  if (key && !checkRateLimit(key, FAILURE_BUDGET).ok) {
    return tooManyRequests(checkRateLimit(key, FAILURE_BUDGET));
  }
  const response = await enableDraftMode(request);
  if (key && response.status >= 400) {
    recordFailure(key, FAILURE_BUDGET);
  }
  return response;
};
