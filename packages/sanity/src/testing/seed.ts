import { readFileSync } from "node:fs";

import { getDefaultLocale, isSiteKey } from "@repo/internationalization/sites";

import {
  footerQuery,
  navigationQuery,
  pageMetadataQuery,
  pagePathsQuery,
  pageQuery,
  redirectsQuery,
  settingsQuery,
  sitemapQuery,
} from "../queries";

type Document = Record<string, unknown> & { _id: string; _type: string };
type Params = Record<string, unknown>;

/** The Studio's seed content (`pnpm seed`), the dataset the comparisons run against. */
export const seedDataset: Document[] = readFileSync(
  new URL("../../../../apps/studio/seed/dataset.ndjson", import.meta.url),
  "utf-8"
)
  .trim()
  .split("\n")
  .map((line) => JSON.parse(line) as Document);

const ofType = (type: string) =>
  seedDataset.filter((doc) => doc._type === type);
const defaultLocale = (site: unknown) =>
  isSiteKey(site) ? getDefaultLocale(site) : undefined;

const pages: Params[] = ofType("page").map((doc) => ({
  defaultLocale: defaultLocale(doc.site),
  locale: doc.language,
  path: (doc.slug as { current: string }).current,
  site: doc.site,
}));
pages.push({
  defaultLocale: "en",
  locale: "en",
  path: "/no-such-page",
  site: "brand-a",
});

const singletons = (type: string): Params[] =>
  ofType(type).map((doc) => ({
    defaultLocale: defaultLocale(doc.site),
    id: doc._id,
    locale: doc.language ?? defaultLocale(doc.site),
    site: doc.site,
  }));

/** Every query with the parameter sets the seed content supports: each page plus a missing one. */
export const seedCases: { name: string; query: string; params: Params[] }[] = [
  { name: "pageQuery", params: pages, query: pageQuery },
  { name: "pageMetadataQuery", params: pages, query: pageMetadataQuery },
  { name: "pagePathsQuery", params: [{}], query: pagePathsQuery },
  {
    name: "sitemapQuery",
    params: ["brand-a", "brand-b"].map((site) => ({ site })),
    query: sitemapQuery,
  },
  {
    name: "navigationQuery",
    params: singletons("navigation"),
    query: navigationQuery,
  },
  { name: "footerQuery", params: singletons("footer"), query: footerQuery },
  {
    name: "settingsQuery",
    params: singletons("settings"),
    query: settingsQuery,
  },
  { name: "redirectsQuery", params: [{}], query: redirectsQuery },
];
