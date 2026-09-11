import { describe, expect, test } from "vitest";

import { strings } from "../seed/manifest.ts";
import {
  buildSeedDocuments,
  metaDescription,
  workAlt,
} from "./seed-documents.ts";
import type {
  MetWork,
  SeedSiteInput,
  WikipediaText,
} from "./seed-documents.ts";

const work = (
  objectID: number,
  title: string,
  artist = "Vincent van Gogh"
): MetWork => ({
  artistDisplayName: artist,
  creditLine: "Purchase, 1993",
  medium: "Oil on canvas",
  objectDate: "1889",
  objectID,
  objectURL: `https://www.metmuseum.org/art/collection/search/${objectID}`,
  primaryImageSmall: `https://images.metmuseum.org/${objectID}.jpg`,
  title,
});

const text = (title: string, ...paragraphs: string[]): WikipediaText => ({
  paragraphs,
  title,
  url: `https://en.wikipedia.org/wiki/${title.replaceAll(" ", "_")}`,
});

const site: SeedSiteInput = {
  home: {
    texts: {
      de: text("Post-Impressionismus", "Erster Absatz.", "Zweiter Absatz."),
      en: text("Post-Impressionism", "First paragraph.", "Second paragraph."),
    },
    works: [
      work(1, "Wheat Field with Cypresses"),
      work(2, "The Dance Class", "Edgar Degas"),
    ],
  },
  inner: {
    slug: "/vincent-van-gogh",
    texts: {
      de: text("Vincent van Gogh", "Absatz eins.", "Absatz zwei."),
      en: text("Vincent van Gogh", "Paragraph one.", "Paragraph two."),
    },
    works: [
      work(3, "Self-Portrait with a Straw Hat"),
      work(1, "Wheat Field with Cypresses"),
    ],
  },
  locales: ["en", "de"],
  site: "brand-a",
};

const build = (input: SeedSiteInput = site) =>
  buildSeedDocuments({
    openAccessUrl: "https://www.metmuseum.org/open-access",
    sites: [input],
    strings,
  });

const collectKeys = (value: unknown, path: string, seen: string[]) => {
  if (Array.isArray(value)) {
    const keys = value
      .map((item) => (item as { _key?: string })?._key)
      .filter((key): key is string => typeof key === "string");
    if (new Set(keys).size !== keys.length) {
      seen.push(path);
    }
    for (const [index, item] of value.entries()) {
      collectKeys(item, `${path}[${index}]`, seen);
    }
  } else if (value && typeof value === "object") {
    for (const [key, item] of Object.entries(value)) {
      collectKeys(item, `${path}.${key}`, seen);
    }
  }
};

describe(buildSeedDocuments, () => {
  test("creates the singletons under the IDs the site reads", () => {
    const ids = build().map((document) => document._id);
    expect(ids).toStrictEqual(
      expect.arrayContaining([
        "settings-brand-a",
        "navigation-brand-a-en",
        "navigation-brand-a-de",
        "footer-brand-a-en",
        "footer-brand-a-de",
      ])
    );
  });

  test("links every page to its translations through translation metadata", () => {
    const documents = build();
    const pages = documents.filter((document) => document._type === "page");
    const metadata = documents.filter(
      (document) => document._type === "translation.metadata"
    );
    expect(pages).toHaveLength(4);
    expect(metadata).toHaveLength(2);
    for (const entry of metadata) {
      const refs = (
        entry.translations as {
          _key: string;
          value: { _ref: string; _weak: boolean };
        }[]
      ).map((translation) => translation.value);
      expect(refs.every((ref) => ref._weak)).toBeTruthy();
      for (const ref of refs) {
        expect(pages.some((page) => page._id === ref._ref)).toBeTruthy();
      }
    }
  });

  test("home pages use the root slug and every internal link targets a page of the same language", () => {
    const documents = build();
    const pages = new Map(
      documents
        .filter((document) => document._type === "page")
        .map((page) => [
          page._id,
          page as unknown as { language: string; slug: { current: string } },
        ])
    );
    expect(pages.get("page-brand-a-en-home")?.slug.current).toBe("/");
    expect(pages.get("page-brand-a-de-vincent-van-gogh")?.slug.current).toBe(
      "/vincent-van-gogh"
    );
    const refs = [
      ...JSON.stringify(documents).matchAll(/"_ref":"(?<ref>page-[^"]+)"/gu),
    ].map((match) => match.groups?.ref ?? "");
    expect(refs.length).toBeGreaterThan(0);
    expect(refs.filter((ref) => !pages.has(ref))).toStrictEqual([]);
    const navigation = documents.find(
      (document) => document._id === "navigation-brand-a-de"
    ) as unknown as { columns: { url: { internal?: { _ref: string } } }[] };
    const languages = navigation.columns
      .map((column) => column.url.internal?._ref)
      .filter((ref): ref is string => typeof ref === "string")
      .map((ref) => pages.get(ref)?.language);
    expect(languages).toStrictEqual(["de", "de"]);
  });

  test("every image carries an alt text where the schema requires one", () => {
    const documents = build();
    const json = JSON.stringify(documents);
    const captioned = [
      ...json.matchAll(
        /\{"_sanityAsset":"image@[^"]+","_type":"image"(?<rest>[^}]*"caption"[^}]*)\}/gu
      ),
    ].map((match) => match.groups?.rest ?? "");
    const screenshots = [
      ...json.matchAll(/"screenshot":\{(?<rest>[^}]*)\}/gu),
    ].map((match) => match.groups?.rest ?? "");
    expect(captioned.length + screenshots.length).toBeGreaterThan(0);
    expect(
      [...captioned, ...screenshots].filter((rest) => !rest.includes('"alt":"'))
    ).toStrictEqual([]);
    const page = documents.find((document) => document._type === "page");
    expect((page?.image as { alt: string } | undefined)?.alt).toBe(
      "Wheat Field with Cypresses, Vincent van Gogh, 1889"
    );
  });

  test("array keys are unique within every document", () => {
    const duplicates: string[] = [];
    for (const document of build()) {
      collectKeys(document, document._id, duplicates);
    }
    expect(duplicates).toStrictEqual([]);
  });

  test("credits Wikipedia on every page and in every footer", () => {
    const documents = build();
    const pages = documents.filter((document) => document._type === "page");
    for (const page of pages) {
      expect(JSON.stringify(page)).toContain("CC BY-SA 4.0");
    }
    const footers = documents.filter((document) => document._type === "footer");
    for (const footer of footers) {
      expect(JSON.stringify(footer)).toContain(
        "creativecommons.org/licenses/by-sa/4.0"
      );
    }
  });

  test("refuses a locale the site does not serve", () => {
    expect(() =>
      build({ ...site, locales: ["en", "fr"], site: "brand-b" })
    ).toThrow("brand-b does not serve fr");
  });
});

describe(metaDescription, () => {
  test("keeps short text and cuts long text at a sentence or word boundary", () => {
    expect(metaDescription("Short.")).toBe("Short.");
    const sentence = "A sentence that ends here. ";
    expect(metaDescription(sentence.repeat(8))).toBe(
      `${sentence.repeat(5).trim()}`
    );
    expect(metaDescription("word ".repeat(40))).toMatch(
      /^(?:word ){31}word…$/u
    );
  });
});

describe(workAlt, () => {
  test("drops empty parts", () => {
    expect(workAlt(work(9, "Scenes from the Tale of Genji", ""))).toBe(
      "Scenes from the Tale of Genji, 1889"
    );
  });
});
