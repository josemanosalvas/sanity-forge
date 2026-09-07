/** Per-instance failure counts. An exhausted address is blocked until its window resets. */

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

/** Evict the oldest entry at capacity. */
const MAX_TRACKED_KEYS = 10_000;
/** Sweep expired entries periodically. */
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

/** Reverse proxies must overwrite forwarding headers. Without an address, skip throttling. */
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
