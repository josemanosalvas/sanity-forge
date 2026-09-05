import type { draftMode as nextDraftMode } from "next/headers";
import { NextRequest } from "next/server";
import { beforeEach, describe, expect, test, vi } from "vitest";

import { POST } from "./route";

type DraftModeStore = Awaited<ReturnType<typeof nextDraftMode>>;

const disable = vi.hoisted(() => vi.fn<() => void>());
vi.mock(import("next/headers"), () => ({
  draftMode: () =>
    Promise.resolve({
      disable,
      enable: () => {},
      isEnabled: true,
    } as unknown as DraftModeStore),
}));

const exitTo = (to?: string) =>
  POST(
    new NextRequest(
      `http://localhost:3000/api/draft-mode/disable${
        to === undefined ? "" : `?to=${encodeURIComponent(to)}`
      }`,
      { method: "POST" }
    )
  );

describe("POST /api/draft-mode/disable", () => {
  beforeEach(() => {
    disable.mockClear();
  });

  test("disables Draft Mode and returns to the requested same-origin path", async () => {
    const response = await exitTo("/de/ueber-uns?tab=preise#faq");
    expect(disable).toHaveBeenCalledOnce();
    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe(
      "http://localhost:3000/de/ueber-uns?tab=preise#faq"
    );
  });

  test("defaults to the home page", async () => {
    const response = await exitTo();
    expect(response.headers.get("location")).toBe("http://localhost:3000/");
  });

  test.each([
    "/\\evil.com",
    "/\\\\evil.com",
    "/\t/evil.com",
    "//evil.com",
    "https://evil.com/",
    "/..//evil.com",
    "/%2e%2e//evil.com",
    "/./\\evil.com",
    "http://localhost:3000//evil.com",
  ])("never redirects off-site for %j", async (to) => {
    const response = await exitTo(to);
    const location = response.headers.get("location") ?? "";
    expect(new URL(location).origin).toBe("http://localhost:3000");
    expect(location).not.toContain("//evil.com");
  });

  test("a foreign absolute URL falls back to the home page", async () => {
    const response = await exitTo("https://evil.com/");
    expect(response.headers.get("location")).toBe("http://localhost:3000/");
  });
});
