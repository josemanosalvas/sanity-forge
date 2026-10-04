import type {
  consoleLoggingIntegration as sentryConsoleLogging,
  init as sentryInit,
  replayIntegration as sentryReplay,
} from "@sentry/nextjs";
import { afterEach, describe, expect, it, vi } from "vitest";

const { init } = vi.hoisted(() => ({ init: vi.fn<typeof sentryInit>() }));
vi.mock(import("@sentry/nextjs"), () => ({
  consoleLoggingIntegration: vi.fn<typeof sentryConsoleLogging>(),
  init,
  replayIntegration: vi.fn<typeof sentryReplay>(),
}));

const DSN = "https://public@o0.ingest.sentry.io/0";

const runtimes = {
  browser: () => import("./client"),
  server: () => import("./server"),
};

describe("Sentry data collection", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetAllMocks();
  });

  it.each(Object.entries(runtimes))(
    "%s events leave out cookies, bodies and user IPs",
    async (_runtime, load) => {
      vi.stubEnv("NEXT_PUBLIC_SENTRY_DSN", DSN);
      const { initializeObservability } = await load();
      initializeObservability();

      expect(init).toHaveBeenCalledOnce();
      expect(init.mock.calls[0]?.[0]).toMatchObject({
        dataCollection: {
          cookies: false,
          httpBodies: [],
          httpHeaders: { request: { deny: expect.arrayContaining(["-ip"]) } },
          userInfo: false,
        },
      });
    }
  );

  it("the server never sends local variables from production", async () => {
    vi.stubEnv("NEXT_PUBLIC_SENTRY_DSN", DSN);
    vi.stubEnv("NODE_ENV", "production");
    const { initializeObservability } = await import("./server");
    initializeObservability();

    expect(init.mock.calls[0]?.[0]).toMatchObject({
      includeLocalVariables: false,
    });
  });
});
