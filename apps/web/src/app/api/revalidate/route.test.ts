import type { parseBody as parseWebhookBody } from "next-sanity/webhook";
import type { revalidatePath as revalidateNextPath } from "next/cache";
import { NextRequest } from "next/server";
import { afterEach, describe, expect, test, vi } from "vitest";

import { POST } from "./route";

// Typed after the real signatures so the assertions below check real call shapes.
const { parseBody, revalidatePath } = vi.hoisted(() => ({
  parseBody: vi.fn<typeof parseWebhookBody>(),
  revalidatePath: vi.fn<typeof revalidateNextPath>(),
}));
vi.mock(import("next-sanity/webhook"), () => ({
  // `parseBody` is generic over the body type; a mock cannot be.
  parseBody: parseBody as unknown as typeof parseWebhookBody,
}));
vi.mock(import("next/cache"), () => ({ revalidatePath }));

const request = () =>
  new NextRequest("http://localhost/api/revalidate", { method: "POST" });

describe("revalidation webhook", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetAllMocks();
  });

  test("fails closed without a secret or valid signature", async () => {
    vi.stubEnv("SANITY_REVALIDATE_SECRET", "");
    await expect(POST(request())).resolves.toMatchObject({ status: 501 });
    expect(parseBody).not.toHaveBeenCalled();

    vi.stubEnv("SANITY_REVALIDATE_SECRET", "test-secret");
    parseBody.mockResolvedValue({
      body: { _type: "page" },
      isValidSignature: false,
    });
    await expect(POST(request())).resolves.toMatchObject({ status: 401 });
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  test("rejects malformed and unsupported payloads without invalidating caches", async () => {
    vi.stubEnv("SANITY_REVALIDATE_SECRET", "test-secret");
    parseBody.mockRejectedValueOnce(new SyntaxError("Invalid JSON"));
    await expect(POST(request())).resolves.toMatchObject({ status: 400 });
    parseBody.mockResolvedValue({
      body: { syncTags: ["not-a-webhook-field"] },
      isValidSignature: true,
    });
    await expect(POST(request())).resolves.toMatchObject({ status: 400 });
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  test("a signed shared-content event invalidates rewritten pages and each sitemap", async () => {
    vi.stubEnv("SANITY_REVALIDATE_SECRET", "test-secret");
    parseBody.mockResolvedValue({
      body: { _type: "faq" },
      isValidSignature: true,
    });
    await expect(POST(request())).resolves.toMatchObject({ status: 200 });
    expect(revalidatePath.mock.calls).toStrictEqual([
      ["/[site]/[locale]", "layout"],
      ["/sitemap/brand-a.xml"],
      ["/sitemap/brand-b.xml"],
    ]);
  });
});
