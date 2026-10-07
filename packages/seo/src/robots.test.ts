import { getSite } from "@repo/internationalization/sites";
import { describe, expect, it } from "vitest";

import { robotsTxt } from "./robots";

describe(robotsTxt, () => {
  it("emits the site's rules, host and sitemap in robots.txt syntax", () => {
    expect(robotsTxt(getSite("brand-a"))).toBe(
      [
        "User-Agent: *",
        "Allow: /",
        "Disallow: /api/",
        "",
        "Host: https://brand-a.example",
        "Sitemap: https://brand-a.example/sitemap.xml",
        "",
      ].join("\n")
    );
  });
});
