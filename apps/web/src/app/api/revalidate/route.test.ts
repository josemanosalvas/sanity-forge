import { MAX_SYNC_TAGS } from "@repo/sanity/tags";
import { parseTags } from "next-sanity/live";
import type { revalidateTag as revalidateNextTag } from "next/cache";
import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { POST } from "./route";

// Typed after the real signature so the assertions below check real call shapes.
const { revalidateTag } = vi.hoisted(() => ({
  revalidateTag: vi.fn<typeof revalidateNextTag>(),
}));
vi.mock(import("next/cache"), () => ({ revalidateTag }));

const SECRET = "test-secret-with-at-least-thirty-two-characters";

const request = ({
  body,
  headers,
  secret = SECRET,
}: {
  body?: BodyInit;
  headers?: Record<string, string>;
  secret?: string | null;
} = {}) =>
  new NextRequest("http://localhost/api/revalidate", {
    body,
    headers: {
      ...(secret === null ? {} : { authorization: `Bearer ${secret}` }),
      ...headers,
    },
    method: "POST",
  });

const json = (value: unknown) => JSON.stringify(value);

describe("revalidation route", () => {
  beforeEach(() => {
    vi.stubEnv("SANITY_REVALIDATE_SECRET", SECRET);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetAllMocks();
  });

  it("invalidates exactly the published sync tags, as next-sanity tags them", async () => {
    const response = await POST(
      request({ body: json({ syncTags: ["s1:abc", "s1:def", "s1:abc"] }) })
    );
    expect(response.status).toBe(200);
    expect(revalidateTag.mock.calls).toStrictEqual([
      ["sanity:s1:abc", "max"],
      ["sanity:s1:def", "max"],
    ]);
    // `parseTags` accepts only tags in the form `defineLive` caches under.
    const tags = revalidateTag.mock.calls.map(([tag]) => tag);
    expect(parseTags(tags).tagsWithoutPrefix).toStrictEqual([
      "s1:abc",
      "s1:def",
    ]);
  });

  it("a publish never fires the coarse site or content tags", async () => {
    await POST(request({ body: json({ syncTags: ["s1:abc"] }) }));
    const tags = revalidateTag.mock.calls.map(([tag]) => tag);
    expect(tags.some((tag) => tag.startsWith("sanity-content"))).toBeFalsy();
  });

  it("an operator purge invalidates one site's reads or every read", async () => {
    await expect(
      POST(request({ body: json({ purge: true, site: "brand-b" }) }))
    ).resolves.toMatchObject({ status: 200 });
    await expect(
      POST(request({ body: json({ purge: true }) }))
    ).resolves.toMatchObject({ status: 200 });
    expect(revalidateTag.mock.calls).toStrictEqual([
      ["sanity-content:brand-b", "max"],
      ["sanity-content", "max"],
    ]);
  });

  it("an unknown site is rejected instead of widening the purge", async () => {
    const response = await POST(
      request({ body: json({ purge: true, site: "not-a-site" }) })
    );
    expect(response.status).toBe(400);
    expect(revalidateTag).not.toHaveBeenCalled();
  });

  it("fails closed without a valid bearer secret", async () => {
    const body = json({ syncTags: ["s1:abc"] });
    const responses = await Promise.all(
      [null, "wrong-secret", `${SECRET}x`, ""].map((secret) =>
        POST(request({ body, secret }))
      )
    );
    expect(responses.map(({ status }) => status)).toStrictEqual([
      401, 401, 401, 401,
    ]);
    const basic = await POST(
      request({ body, headers: { authorization: `Basic ${SECRET}` } })
    );
    expect(basic.status).toBe(401);
    expect(revalidateTag).not.toHaveBeenCalled();
  });

  it("rejects malformed and out-of-bounds payloads without invalidating caches", async () => {
    const tooMany = Array.from(
      { length: MAX_SYNC_TAGS + 1 },
      (_, index) => `s1:${index}`
    );
    const bodies = [
      "not json",
      json({}),
      json({ syncTags: [] }),
      json({ syncTags: tooMany }),
      json({ syncTags: ["has space"] }),
      json({ syncTags: ["x".repeat(250)] }),
      json({ syncTags: [42] }),
      json({ purge: "yes" }),
      json({ purge: true, syncTags: ["s1:abc"] }),
      // The signed webhook's projection is no longer accepted.
      json({ _type: "page", site: "brand-a" }),
    ];
    const responses = await Promise.all(
      bodies.map((body) => POST(request({ body })))
    );
    expect(responses.map(({ status }) => status)).toStrictEqual(
      bodies.map(() => 400)
    );
    expect(revalidateTag).not.toHaveBeenCalled();
  });

  it("accepts a full batch and refuses an oversized body before parsing it", async () => {
    const batch = Array.from(
      { length: MAX_SYNC_TAGS },
      (_, index) => `s1:${String(index).padStart(240, "0")}`
    );
    await expect(
      POST(request({ body: json({ syncTags: batch }) }))
    ).resolves.toMatchObject({ status: 200 });
    expect(revalidateTag).toHaveBeenCalledTimes(MAX_SYNC_TAGS);

    revalidateTag.mockClear();
    const oversized = json({
      padding: "x".repeat(40_000),
      syncTags: ["s1:abc"],
    });
    await expect(POST(request({ body: oversized }))).resolves.toMatchObject({
      status: 413,
    });
    // A declared length alone is enough to refuse.
    await expect(
      POST(
        request({
          body: json({ syncTags: ["s1:abc"] }),
          headers: { "content-length": "1000000" },
        })
      )
    ).resolves.toMatchObject({ status: 413 });
    expect(revalidateTag).not.toHaveBeenCalled();
  });

  it("a cache failure is reported so the Function does not acknowledge it", async () => {
    revalidateTag.mockImplementation(() => {
      throw new Error("cache unavailable");
    });
    vi.spyOn(console, "error").mockReturnValue();
    const response = await POST(
      request({ body: json({ syncTags: ["s1:abc"] }) })
    );
    expect(response.status).toBe(500);
  });

  it("successful deliveries do not consume the failure budget", async () => {
    const headers = { "x-forwarded-for": "203.0.113.77" };
    const body = json({ syncTags: ["s1:abc"] });
    const accepted = await Promise.all(
      Array.from({ length: 100 }, () => POST(request({ body, headers })))
    );
    expect(accepted.every((response) => response.status === 200)).toBeTruthy();

    const rejected = await Promise.all(
      Array.from({ length: 30 }, () =>
        POST(request({ body, headers, secret: "wrong-secret" }))
      )
    );
    expect(rejected.every((response) => response.status === 401)).toBeTruthy();
    const refused = await POST(request({ body, headers }));
    expect(refused.status).toBe(429);
    expect(refused.headers.get("retry-after")).toMatch(/^\d+$/u);
  });

  it("a missing or short secret disables the route without touching the cache", async () => {
    const body = json({ syncTags: ["s1:abc"] });
    vi.stubEnv("SANITY_REVALIDATE_SECRET", "");
    await expect(POST(request({ body }))).resolves.toMatchObject({
      status: 501,
    });
    vi.stubEnv("SANITY_REVALIDATE_SECRET", "short-secret");
    vi.spyOn(console, "error").mockReturnValue();
    await expect(
      POST(request({ body, secret: "short-secret" }))
    ).resolves.toMatchObject({ status: 501 });
    expect(revalidateTag).not.toHaveBeenCalled();
  });
});
