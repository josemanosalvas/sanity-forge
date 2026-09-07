import { client } from "@repo/sanity/client";
import { defineEnableDraftMode } from "next-sanity/draft-mode";

import {
  checkRateLimit,
  clientAddress,
  recordFailure,
  tooManyRequests,
} from "@/lib/rate-limit";

const { GET: enableDraftMode } = defineEnableDraftMode({ client });

const FAILURE_BUDGET = { limit: 20, windowMs: 60_000 };

/** Reject requests from an address after repeated failed handshakes. */
export const GET = async (request: Request): Promise<Response> => {
  const address = clientAddress(request.headers);
  const key = address ? `draft-mode:${address}` : null;
  const limit = key ? checkRateLimit(key, FAILURE_BUDGET) : null;
  if (limit && !limit.ok) {
    return tooManyRequests(limit);
  }
  const response = await enableDraftMode(request);
  if (key && response.status >= 400) {
    recordFailure(key, FAILURE_BUDGET);
  }
  return response;
};
