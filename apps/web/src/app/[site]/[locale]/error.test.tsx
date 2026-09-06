import en from "@repo/internationalization/messages/en";
import { SiteProvider } from "@repo/internationalization/navigation";
import { getSite } from "@repo/internationalization/sites";
import { NextIntlClientProvider } from "next-intl";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test, vi } from "vitest";

vi.mock(import("@repo/observability/client"), () => ({
  captureException: vi.fn<() => string>(() => "event-1"),
  initializeObservability: vi.fn<() => void>(),
  onRouterTransitionStart: vi.fn<() => void>(),
}));

const { default: ErrorBoundary } = await import("./error");

const render = (error: Error & { digest?: string }) =>
  renderToStaticMarkup(
    <NextIntlClientProvider locale="en" messages={en}>
      <SiteProvider site={getSite("brand-a")}>
        <ErrorBoundary error={error} retry={vi.fn<() => void>()} />
      </SiteProvider>
    </NextIntlClientProvider>
  );

describe("error boundary", () => {
  test("shows the translated copy and the digest, never the message", () => {
    const html = render(Object.assign(new Error("boom"), { digest: "d1g3st" }));
    expect(html).toContain(en.error.title);
    expect(html).toContain(en.error.body);
    expect(html).toContain("d1g3st");
    // Server errors arrive sanitized; never echo the message.
    expect(html).not.toContain("boom");
  });

  test("offers a retry and a way home", () => {
    const html = render(new Error("boom"));
    expect(html).toContain(en.error.retry);
    expect(html).toMatch(/<a[^>]*href="\/"/u);
  });

  test("renders without an identifier when the error has no digest", () => {
    const html = render(new Error("boom"));
    expect(html).not.toContain(en.error.errorId);
    expect(html).toContain(en.error.title);
  });
});
