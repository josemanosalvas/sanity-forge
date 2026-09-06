/**
 * A fixed-window limiter for the public endpoints that do real work per
 * request. It is charged only for requests that fail authentication (a bad
 * webhook signature, an invalid preview secret), so legitimate traffic is
 * never throttled; its job is to stop a scanner from turning either check
 * into a loop. State lives in the server instance, so on serverless
 * platforms the ceiling applies per instance. Swap the store for a shared
 * one (Redis, Upstash) when one deployment must enforce a global budget.
 */

export interface RateLimitOptions {
  /** Failures allowed per window. */
  readonly limit: number;
  /** Window length in milliseconds. */
  readonly windowMs: number;
  /** Clock override for tests. */
  readonly now?: () => number;
}

export interface RateLimitResult {
  readonly ok: boolean;
  readonly remaining: number;
  /** Seconds until the window resets; `0` when the request was allowed. */
  readonly retryAfterSeconds: number;
}

interface Window {
  count: number;
  resetAt: number;
}

/** Live keys kept; the oldest window is evicted beyond this, so memory is bounded. */
const MAX_TRACKED_KEYS = 10_000;
/** Expired windows are swept this often, so the sweep is amortised rather than per request. */
const PRUNE_EVERY = 1000;

const store = new Map<string, Window>();
let sinceLastPrune = 0;

const prune = (now: number) => {
  sinceLastPrune = 0;
  for (const [key, window] of store) {
    if (window.resetAt <= now) {
      store.delete(key);
    }
  }
};

const track = (key: string, window: Window) => {
  if (!store.has(key) && store.size >= MAX_TRACKED_KEYS) {
    // Map iteration is insertion-ordered: the first key is the oldest.
    const oldest = store.keys().next().value;
    if (oldest !== undefined) {
      store.delete(oldest);
    }
  }
  store.set(key, window);
};

const currentWindow = (
  key: string,
  { windowMs, now = Date.now }: RateLimitOptions
) => {
  const time = now();
  sinceLastPrune += 1;
  if (sinceLastPrune >= PRUNE_EVERY) {
    prune(time);
  }
  const existing = store.get(key);
  return {
    time,
    window:
      existing && existing.resetAt > time
        ? existing
        : { count: 0, resetAt: time + windowMs },
  };
};

const toResult = (
  window: Window,
  time: number,
  limit: number
): RateLimitResult => {
  const ok = window.count < limit;
  return {
    ok,
    remaining: Math.max(0, limit - window.count),
    retryAfterSeconds: ok ? 0 : Math.ceil((window.resetAt - time) / 1000),
  };
};

/** Whether the key still has budget, without spending any. */
export const checkRateLimit = (
  key: string,
  options: RateLimitOptions
): RateLimitResult => {
  const { time, window } = currentWindow(key, options);
  return toResult(window, time, options.limit);
};

/** Spends one unit of the key's budget and reports what is left. */
export const recordFailure = (
  key: string,
  options: RateLimitOptions
): RateLimitResult => {
  const { time, window } = currentWindow(key, options);
  window.count += 1;
  track(key, window);
  return toResult(window, time, options.limit);
};

/**
 * The client address as the platform reports it, or `null` when no
 * forwarding header is present: without one, every request would share a
 * bucket, so callers skip the limiter and rely on the authentication check
 * alone (a proxy that terminates TLS for the site must set the header).
 */
export const clientAddress = (headers: Headers): string | null => {
  const forwarded = headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || headers.get("x-real-ip")?.trim() || null;
};

export const tooManyRequests = (result: RateLimitResult): Response =>
  new Response("Too many requests", {
    headers: {
      "cache-control": "no-store",
      "retry-after": String(Math.max(1, result.retryAfterSeconds)),
    },
    status: 429,
  });
