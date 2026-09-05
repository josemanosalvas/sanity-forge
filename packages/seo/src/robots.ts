import type { Site } from "@repo/internationalization/sites";
import type { MetadataRoute } from "next";

import { canonicalOrigin } from "./route";

/** Default robots rules for a site: crawl everything public, point at its sitemap. */
export const siteRobots = (site: Site): MetadataRoute.Robots => ({
  host: canonicalOrigin(site),
  rules: [{ allow: "/", disallow: ["/api/"], userAgent: "*" }],
  sitemap: `${canonicalOrigin(site)}/sitemap.xml`,
});

const toArray = <T>(value: T | T[] | undefined): T[] => {
  if (value === undefined) {
    return [];
  }
  return Array.isArray(value) ? value : [value];
};

type RobotsRule = Exclude<MetadataRoute.Robots["rules"], unknown[]>;

const ruleLines = (rule: RobotsRule): string[] => [
  ...toArray(rule.userAgent).map((agent) => `User-Agent: ${agent}`),
  ...toArray(rule.allow).map((path) => `Allow: ${path}`),
  ...toArray(rule.disallow).map((path) => `Disallow: ${path}`),
  ...(rule.crawlDelay === undefined ? [] : [`Crawl-Delay: ${rule.crawlDelay}`]),
];

/** The `robots.txt` body for a site, in the layout Next's metadata route emits. */
export const robotsTxt = (site: Site): string => {
  const robots = siteRobots(site);
  const rules = toArray(robots.rules).map((rule) => ruleLines(rule).join("\n"));
  const footer = [
    ...(robots.host ? [`Host: ${robots.host}`] : []),
    ...toArray(robots.sitemap).map((url) => `Sitemap: ${url}`),
  ];
  return `${[...rules, footer.join("\n")].join("\n\n")}\n`;
};
