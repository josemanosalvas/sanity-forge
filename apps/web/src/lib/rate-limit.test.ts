import { describe, expect, test } from "vitest";

import {
  checkRateLimit,
  clientAddress,
  recordFailure,
  tooManyRequests,
} from "./rate-limit";

describe("rate limit", () => {
  test("failures spend the budget inside a window, which then resets", () => {
    let time = 1000;
    const options = { limit: 2, now: () => time, windowMs: 60_000 };

    expect(checkRateLimit("a", options)).toMatchObject({ ok: true });
    expect(recordFailure("a", options)).toMatchObject({ remaining: 1 });
    expect(recordFailure("a", options)).toMatchObject({ ok: false });

    expect(checkRateLimit("a", options)).toMatchObject({
      ok: false,
      retryAfterSeconds: 60,
    });

    time += 60_000;
    expect(checkRateLimit("a", options)).toMatchObject({ ok: true });
  });

  test("checking never spends budget and keys are independent", () => {
    const options = { limit: 1, now: () => 0, windowMs: 1000 };
    const checks = Array.from({ length: 5 }, () =>
      checkRateLimit("b", options)
    );
    expect(checks.every((result) => result.ok)).toBeTruthy();
    recordFailure("b", options);
    expect(checkRateLimit("b", options).ok).toBeFalsy();
    expect(checkRateLimit("c", options).ok).toBeTruthy();
  });

  test("the store evicts its oldest window instead of growing without bound", () => {
    const options = { limit: 1, now: () => 0, windowMs: 60_000 };
    recordFailure("first", options);
    for (let i = 0; i < 10_000; i += 1) {
      recordFailure(`flood-${i}`, options);
    }
    // "first" was the oldest live window and has been evicted.
    expect(checkRateLimit("first", options).ok).toBeTruthy();
  });
});

describe(clientAddress, () => {
  test("prefers the first forwarded address, then x-real-ip, else null", () => {
    expect(
      clientAddress(new Headers({ "x-forwarded-for": "203.0.113.9, 10.0.0.1" }))
    ).toBe("203.0.113.9");
    expect(clientAddress(new Headers({ "x-real-ip": "198.51.100.2" }))).toBe(
      "198.51.100.2"
    );
    expect(clientAddress(new Headers())).toBeNull();
  });
});

describe(tooManyRequests, () => {
  test("answers 429 with a retry-after of at least one second", () => {
    const response = tooManyRequests({
      ok: false,
      remaining: 0,
      retryAfterSeconds: 0,
    });
    expect(response.status).toBe(429);
    expect(response.headers.get("retry-after")).toBe("1");
    expect(response.headers.get("cache-control")).toBe("no-store");
  });
});
