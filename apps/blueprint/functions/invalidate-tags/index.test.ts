import { MAX_SYNC_TAGS } from "@repo/sanity/tags";
import type {
  SyncTagInvalidateCallback,
  SyncTagInvalidateContext,
} from "@sanity/functions";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { handler } from "./index";

const ENDPOINT = "https://example.com/api/revalidate";
const SECRET = "test-secret-with-at-least-thirty-two-characters";

const send = vi.fn<typeof fetch>();
const done = vi.fn<SyncTagInvalidateCallback>();

const invoke = (syncTags: string[]) =>
  handler({
    context: {} as SyncTagInvalidateContext,
    done,
    event: { data: { syncTags } },
  });

const sentTags = () =>
  send.mock.calls.map(([, init]) => JSON.parse(String(init?.body)).syncTags);

describe("invalidate-tags Function", () => {
  beforeEach(() => {
    vi.stubEnv("REVALIDATE_URL", ENDPOINT);
    vi.stubEnv("SANITY_REVALIDATE_SECRET", SECRET);
    vi.stubGlobal("fetch", send);
    send.mockResolvedValue(new Response(null, { status: 200 }));
    done.mockResolvedValue(new Response(null, { status: 200 }));
    vi.spyOn(console, "log").mockReturnValue();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.resetAllMocks();
  });

  it("forwards the deduplicated sync tags with the bearer secret", async () => {
    await invoke(["s1:abc", "s1:def", "s1:abc"]);
    expect(send).toHaveBeenCalledOnce();
    const [url, init] = send.mock.calls[0] ?? [];
    expect(url).toBe(ENDPOINT);
    expect(init?.method).toBe("POST");
    expect(new Headers(init?.headers).get("authorization")).toBe(
      `Bearer ${SECRET}`
    );
    expect(sentTags()).toStrictEqual([["s1:abc", "s1:def"]]);
  });

  it("acknowledges the event only after the app has invalidated it", async () => {
    await invoke(["s1:abc", "s1:def", "s1:abc"]);
    expect(done).toHaveBeenCalledWith(["s1:abc", "s1:def", "s1:abc"]);
    expect(done.mock.invocationCallOrder[0]).toBeGreaterThan(
      send.mock.invocationCallOrder[0] ?? Infinity
    );
  });

  it("splits a large event into batches the route accepts", async () => {
    const syncTags = Array.from(
      { length: MAX_SYNC_TAGS * 2 + 1 },
      (_, index) => `s1:${index}`
    );
    await invoke(syncTags);
    expect(sentTags().map((batch) => batch.length)).toStrictEqual([
      MAX_SYNC_TAGS,
      MAX_SYNC_TAGS,
      1,
    ]);
    expect(sentTags().flat()).toStrictEqual(syncTags);
    expect(done).toHaveBeenCalledOnce();
  });

  it("a failed delivery throws and is never acknowledged", async () => {
    send.mockResolvedValueOnce(new Response(null, { status: 401 }));
    await expect(invoke(["s1:abc"])).rejects.toThrow("HTTP 401");
    send.mockRejectedValueOnce(new TypeError("fetch failed"));
    await expect(invoke(["s1:abc"])).rejects.toThrow("fetch failed");
    expect(done).not.toHaveBeenCalled();
  });

  it("a rejected acknowledgement is reported", async () => {
    done.mockResolvedValueOnce(new Response(null, { status: 500 }));
    await expect(invoke(["s1:abc"])).rejects.toThrow("done()");
  });

  it("missing configuration fails before any request", async () => {
    vi.stubEnv("REVALIDATE_URL", "");
    await expect(invoke(["s1:abc"])).rejects.toThrow("REVALIDATE_URL");
    vi.stubEnv("REVALIDATE_URL", ENDPOINT);
    vi.stubEnv("SANITY_REVALIDATE_SECRET", "");
    await expect(invoke(["s1:abc"])).rejects.toThrow(
      "SANITY_REVALIDATE_SECRET"
    );
    expect(send).not.toHaveBeenCalled();
    expect(done).not.toHaveBeenCalled();
  });
});
