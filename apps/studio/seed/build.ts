/// <reference types="node" />
import { writeFile } from "node:fs/promises";

import type { Locale } from "@repo/internationalization/locales";

import { buildSeedDocuments, toNdjson } from "../lib/seed-documents.ts";
import type {
  MetWork,
  SeedSiteInput,
  WikipediaText,
} from "../lib/seed-documents.ts";
import {
  MET_API,
  MET_OPEN_ACCESS_URL,
  sources,
  strings,
  USER_AGENT,
} from "./manifest.ts";
import type { WikipediaSubject } from "./manifest.ts";

interface MetObjectResponse extends MetWork {
  isPublicDomain: boolean;
}

interface WikipediaResponse {
  query: {
    pages: Record<
      string,
      {
        title: string;
        extract?: string;
        pageprops?: { wikibase_item?: string };
      }
    >;
  };
}

const fetchJson = async <T>(url: string): Promise<T> => {
  const response = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}: ${url}`);
  }
  return (await response.json()) as T;
};

const metWork = async (objectID: number): Promise<MetWork> => {
  const object = await fetchJson<MetObjectResponse>(
    `${MET_API}/objects/${objectID}`
  );
  if (!object.isPublicDomain) {
    throw new Error(`Met object ${objectID} is not in the public domain`);
  }
  if (!object.primaryImageSmall) {
    throw new Error(`Met object ${objectID} has no image`);
  }
  return {
    artistDisplayName: object.artistDisplayName,
    creditLine: object.creditLine,
    medium: object.medium,
    objectDate: object.objectDate,
    objectID: object.objectID,
    objectURL: object.objectURL,
    primaryImageSmall: object.primaryImageSmall,
    title: object.title,
  };
};

const wikipediaText = async (
  locale: Locale,
  title: string,
  wikibase: string
): Promise<WikipediaText> => {
  const url = new URL(`https://${locale}.wikipedia.org/w/api.php`);
  url.search = new URLSearchParams({
    action: "query",
    exintro: "1",
    explaintext: "1",
    format: "json",
    ppprop: "wikibase_item",
    prop: "extracts|pageprops",
    redirects: "1",
    titles: title,
  }).toString();
  const { query } = await fetchJson<WikipediaResponse>(url.href);
  const [page] = Object.values(query.pages);
  const item = page?.pageprops?.wikibase_item;
  if (!page?.extract || item !== wikibase) {
    throw new Error(
      `${locale}.wikipedia.org/wiki/${title} resolved to ${item ?? "no item"}, expected ${wikibase}`
    );
  }
  return {
    paragraphs: page.extract
      .split("\n")
      .map((paragraph) => paragraph.trim())
      .filter((paragraph) => paragraph !== ""),
    title: page.title,
    url: `https://${locale}.wikipedia.org/wiki/${encodeURIComponent(page.title.replaceAll(" ", "_"))}`,
  };
};

const texts = async (subject: WikipediaSubject, locales: readonly Locale[]) => {
  const entries = await Promise.all(
    locales.map(async (locale) => {
      const title = subject.titles[locale];
      if (!title) {
        throw new Error(`No ${locale} article for ${subject.wikibase}`);
      }
      return [
        locale,
        await wikipediaText(locale, title, subject.wikibase),
      ] as const;
    })
  );
  return Object.fromEntries(entries) as Partial<Record<Locale, WikipediaText>>;
};

const works = (ids: readonly number[]) => Promise.all(ids.map(metWork));

const sites: SeedSiteInput[] = await Promise.all(
  sources.map(async (source) => {
    const [homeTexts, homeWorks, innerTexts, innerWorks] = await Promise.all([
      texts(source.home.subject, source.locales),
      works(source.home.works),
      texts(source.inner.subject, source.locales),
      works(source.inner.works),
    ]);
    return {
      home: { texts: homeTexts, works: homeWorks },
      inner: { slug: source.inner.slug, texts: innerTexts, works: innerWorks },
      locales: source.locales,
      site: source.site,
    };
  })
);

const documents = buildSeedDocuments({
  openAccessUrl: MET_OPEN_ACCESS_URL,
  sites,
  strings,
});
const output = new URL("dataset.ndjson", import.meta.url);
await writeFile(output, toNdjson(documents));
console.warn(`Wrote ${documents.length} documents to ${output.pathname}`);
