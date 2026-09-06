import type { parseBody as parseWebhookBody } from "next-sanity/webhook";
import type { revalidateTag as revalidateNextTag } from "next/cache";
import { NextRequest } from "next/server";
import { afterEach, describe, expect, test, vi } from "vitest";

import { POST } from "./route";

// Typed after the real signatures so the assertions below check real call shapes.
const { parseBody, revalidateTag } = vi.hoisted(() => ({
  parseBody: vi.fn<typeof parseWebhookBody>(),
  revalidateTag: vi.fn<typeof revalidateNextTag>(),
}));
vi.mock(import("next-sanity/webhook"), () => ({
  // `parseBody` is generic over the body type; a mock cannot be.
  parseBody: parseBody as unknown as typeof parseWebhookBody,
}));
vi.mock(import("next/cache"), () => ({ revalidateTag }));

// The schema requires a long secret; the tests only need it to be present.
const SECRET = "test-secret-with-at-least-thirty-two-characters";

const request = (headers?: HeadersInit) =>
  new NextRequest("http://localhost/api/revalidate", {
    headers,
    method: "POST",
  });

describe("revalidation webhook", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetAllMocks();
  });

  test("fails closed without a secret or valid signature", async () => {
    vi.stubEnv("SANITY_REVALIDATE_SECRET", "");
    await expect(POST(request())).resolves.toMatchObject({ status: 501 });
    expect(parseBody).not.toHaveBeenCalled();

    vi.stubEnv("SANITY_REVALIDATE_SECRET", SECRET);
    parseBody.mockResolvedValue({
      body: { _type: "page" },
      isValidSignature: false,
    });
    await expect(POST(request())).resolves.toMatchObject({ status: 401 });
    expect(revalidateTag).not.toHaveBeenCalled();
  });

  test("rejects malformed and unsupported payloads without invalidating caches", async () => {
    vi.stubEnv("SANITY_REVALIDATE_SECRET", SECRET);
    parseBody.mockRejectedValueOnce(new SyntaxError("Invalid JSON"));
    await expect(POST(request())).resolves.toMatchObject({ status: 400 });
    parseBody.mockResolvedValue({
      body: { syncTags: ["not-a-webhook-field"] },
      isValidSignature: true,
    });
    await expect(POST(request())).resolves.toMatchObject({ status: 400 });
    expect(revalidateTag).not.toHaveBeenCalled();
  });

  test("a site-scoped document invalidates that site's reads only", async () => {
    vi.stubEnv("SANITY_REVALIDATE_SECRET", SECRET);
    parseBody.mockResolvedValue({
      body: { _type: "page", site: "brand-b" },
      isValidSignature: true,
    });
    await expect(POST(request())).resolves.toMatchObject({ status: 200 });
    expect(revalidateTag.mock.calls).toStrictEqual([
      ["sanity-content:brand-b", "max"],
    ]);
  });

  test("shared content and unknown sites invalidate every read", async () => {
    vi.stubEnv("SANITY_REVALIDATE_SECRET", SECRET);
    parseBody.mockResolvedValue({
      body: { _type: "faq" },
      isValidSignature: true,
    });
    await expect(POST(request())).resolves.toMatchObject({ status: 200 });
    parseBody.mockResolvedValue({
      body: { _type: "page", site: "not-a-site" },
      isValidSignature: true,
    });
    await expect(POST(request())).resolves.toMatchObject({ status: 200 });
    expect(revalidateTag.mock.calls).toStrictEqual([
      ["sanity-content", "max"],
      ["sanity-content", "max"],
    ]);
  });

  test("signed deliveries are never rate-limited, unsigned ones are", async () => {
    vi.stubEnv("SANITY_REVALIDATE_SECRET", SECRET);
    parseBody.mockResolvedValue({
      body: { _type: "page" },
      isValidSignature: true,
    });
    const headers = { "x-forwarded-for": "203.0.113.77" };
    // Well past any budget: every signed delivery still lands.
    const accepted = await Promise.all(
      Array.from({ length: 100 }, () => POST(request(headers)))
    );
    expect(accepted.every((response) => response.status === 200)).toBeTruthy();

    parseBody.mockResolvedValue({
      body: { _type: "page" },
      isValidSignature: false,
    });
    const rejected = await Promise.all(
      Array.from({ length: 30 }, () => POST(request(headers)))
    );
    expect(rejected.every((response) => response.status === 401)).toBeTruthy();
    const refused = await POST(request(headers));
    expect(refused.status).toBe(429);
    expect(refused.headers.get("retry-after")).toMatch(/^\d+$/u);
  });

  test("a short secret disables the webhook without touching the cache", async () => {
    vi.stubEnv("SANITY_REVALIDATE_SECRET", "short-secret");
    await expect(POST(request())).resolves.toMatchObject({ status: 501 });
    expect(parseBody).not.toHaveBeenCalled();
    expect(revalidateTag).not.toHaveBeenCalled();
  });
});
