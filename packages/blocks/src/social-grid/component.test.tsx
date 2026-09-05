import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";

import { SocialGrid } from "./component";

describe(SocialGrid, () => {
  const twoSocials = renderToStaticMarkup(
    <SocialGrid
      eyebrow="Socials"
      socials={[
        {
          _key: "s1",
          href: "https://reddit.com/r/example",
          label: "Reddit",
          openInNewTab: true,
          platform: "reddit",
        },
        {
          _key: "s2",
          href: "https://github.com/example",
          label: "GitHub",
          platform: "github",
        },
      ]}
      subtitle="Join our community today and stay updated."
      title="Join our community"
    />
  );

  test("SocialGrid renders the header", () => {
    expect(twoSocials).toMatch(/Socials/u);
    expect(twoSocials).toMatch(/Join our community/u);
    expect(twoSocials).toMatch(/Join our community today and stay updated\./u);
  });

  test("SocialGrid renders a linked card per social", () => {
    expect(twoSocials).toMatch(/Reddit/u);
    expect(twoSocials).toMatch(/GitHub/u);
    expect(twoSocials).toMatch(/href="https:\/\/reddit\.com\/r\/example"/u);
    expect(twoSocials).toContain('target="_blank"');
    expect(twoSocials).toContain("bg-highlight");
  });

  test("SocialGrid renders a card without a link", () => {
    const html = renderToStaticMarkup(
      <SocialGrid
        socials={[{ _key: "s1", label: "YouTube", platform: "youtube" }]}
        title="Follow us"
      />
    );

    expect(html).toMatch(/YouTube/u);
    expect(html).not.toContain("<a ");
  });

  test("SocialGrid renders nothing when there are no socials", () => {
    const html = renderToStaticMarkup(
      <SocialGrid title="Join our community" />
    );

    expect(html).toBe("");
  });
});
