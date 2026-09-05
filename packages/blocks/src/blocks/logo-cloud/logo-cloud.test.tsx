import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";

import { LogoCloud } from "./logo-cloud";

describe(LogoCloud, () => {
  test("LogoCloud renders the logos", () => {
    const html = renderToStaticMarkup(
      <LogoCloud
        logos={[
          {
            _key: "logo-1",
            href: "https://example.com",
            image: { alt: "Acme", id: "image-abc123-200x80-png" },
            openInNewTab: true,
          },
        ]}
      />
    );

    expect(html).toMatch(/alt="Acme"/u);
    expect(html).toMatch(/href="https:\/\/example\.com"/u);
    expect(html).toContain('target="_blank"');
  });

  test("LogoCloud renders logos without a link", () => {
    const html = renderToStaticMarkup(
      <LogoCloud
        logos={[
          {
            _key: "logo-1",
            image: { alt: "Beta", id: "image-def456-200x80-png" },
          },
        ]}
      />
    );

    expect(html).toMatch(/alt="Beta"/u);
    expect(html).not.toContain("<a ");
  });

  test("LogoCloud renders nothing when there are no logos", () => {
    const html = renderToStaticMarkup(<LogoCloud />);

    expect(html).toBe("");
  });
});
