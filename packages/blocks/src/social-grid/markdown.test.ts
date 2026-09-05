import { describe, expect, test } from "vitest";

import { socialGridToMarkdown } from "./markdown";

describe(socialGridToMarkdown, () => {
  test("socialGridToMarkdown returns empty string for a fully empty block", () => {
    expect(socialGridToMarkdown({}, {})).toBe("");
  });

  test("socialGridToMarkdown renders the eyebrow, title and subtitle", () => {
    const result = socialGridToMarkdown(
      {
        eyebrow: "Socials",
        subtitle: "Stay updated with the latest.",
        title: "Join our community",
      },
      {}
    );
    expect(result).toContain("**Socials**");
    expect(result).toContain("## Join our community");
    expect(result).toContain("Stay updated with the latest.");
  });

  test("socialGridToMarkdown renders socials as a linked list", () => {
    const result = socialGridToMarkdown(
      {
        socials: [
          {
            _key: "s1",
            href: "https://reddit.com/r/example",
            label: "Reddit",
            platform: "reddit",
          },
          { _key: "s2", href: "#", label: "GitHub", platform: "github" },
        ],
      },
      {}
    );
    expect(result).toContain("- [Reddit](https://reddit.com/r/example)");
    // A "#" href degrades to plain text, not a link.
    expect(result).toContain("- GitHub");
    expect(result).not.toContain("](#)");
  });

  test("socialGridToMarkdown falls back to the platform when no label is set", () => {
    const result = socialGridToMarkdown(
      {
        socials: [{ _key: "s1", href: "https://yt.com", platform: "youtube" }],
      },
      {}
    );
    expect(result).toContain("- [youtube](https://yt.com)");
  });

  test("socialGridToMarkdown emits no HTML or JSX tags", () => {
    const result = socialGridToMarkdown(
      {
        eyebrow: "Socials",
        socials: [
          {
            _key: "s1",
            href: "https://reddit.com",
            label: "Reddit",
            platform: "reddit",
          },
        ],
        subtitle: "Stay updated.",
        title: "Join our community",
      },
      {}
    );
    expect(result).not.toMatch(/<[A-Za-z]/u);
  });
});
